-- ============================================
-- YAN MAG — Supabase Database Schema
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES (linked to auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. CATEGORIES
-- ============================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  name_es TEXT NOT NULL,
  name_en TEXT,
  description_es TEXT,
  description_en TEXT,
  color TEXT DEFAULT '#e63946',
  icon TEXT DEFAULT 'newspaper',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 3. TAGS
-- ============================================
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  name_es TEXT NOT NULL,
  name_en TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 4. ARTICLES
-- ============================================
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  
  -- Content (Spanish)
  title_es TEXT NOT NULL,
  excerpt_es TEXT,
  content_es TEXT,
  
  -- Content (English)
  title_en TEXT,
  excerpt_en TEXT,
  content_en TEXT,
  
  -- Media
  cover_image TEXT,
  cover_image_alt TEXT,
  
  -- Relations
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Status & Visibility
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Timestamps
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX idx_articles_status ON public.articles(status);
CREATE INDEX idx_articles_category ON public.articles(category_id);
CREATE INDEX idx_articles_author ON public.articles(author_id);
CREATE INDEX idx_articles_published_at ON public.articles(published_at DESC);
CREATE INDEX idx_articles_featured ON public.articles(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_articles_slug ON public.articles(slug);

-- Full-text search index
CREATE INDEX idx_articles_search ON public.articles 
  USING GIN (to_tsvector('spanish', COALESCE(title_es, '') || ' ' || COALESCE(excerpt_es, '') || ' ' || COALESCE(content_es, '')));

-- ============================================
-- 5. ARTICLE_TAGS (many-to-many)
-- ============================================
CREATE TABLE public.article_tags (
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- ============================================
-- 6. PAGES (static pages)
-- ============================================
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title_es TEXT NOT NULL,
  title_en TEXT,
  content_es TEXT,
  content_en TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 7. SITE SETTINGS (singleton)
-- ============================================
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name TEXT DEFAULT 'YAN MAG',
  tagline_es TEXT DEFAULT 'La revista que inspira',
  tagline_en TEXT DEFAULT 'The magazine that inspires',
  description_es TEXT,
  description_en TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  
  -- Social media
  social_instagram TEXT,
  social_twitter TEXT,
  social_facebook TEXT,
  social_tiktok TEXT,
  social_youtube TEXT,
  
  -- SEO
  default_meta_title TEXT DEFAULT 'YAN MAG',
  default_meta_description TEXT,
  
  -- Analytics
  google_analytics_id TEXT,
  
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default settings
INSERT INTO public.site_settings (site_name) VALUES ('YAN MAG');

-- ============================================
-- 8. NEWSLETTER SUBSCRIBERS
-- ============================================
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

CREATE INDEX idx_newsletter_email ON public.newsletter_subscribers(email);
CREATE INDEX idx_newsletter_active ON public.newsletter_subscribers(is_active) WHERE is_active = TRUE;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Helper function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE USING (public.get_user_role() = 'admin');

-- CATEGORIES
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT USING (true);

CREATE POLICY "Admins and editors can manage categories"
  ON public.categories FOR ALL USING (public.get_user_role() IN ('admin', 'editor'));

-- TAGS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tags are viewable by everyone"
  ON public.tags FOR SELECT USING (true);

CREATE POLICY "Admins and editors can manage tags"
  ON public.tags FOR ALL USING (public.get_user_role() IN ('admin', 'editor'));

-- ARTICLES
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published articles are viewable by everyone"
  ON public.articles FOR SELECT USING (
    status = 'published' 
    OR (auth.uid() IS NOT NULL AND public.get_user_role() IN ('admin', 'editor'))
  );

CREATE POLICY "Admins and editors can insert articles"
  ON public.articles FOR INSERT WITH CHECK (public.get_user_role() IN ('admin', 'editor'));

CREATE POLICY "Admins can update any article, editors their own"
  ON public.articles FOR UPDATE USING (
    public.get_user_role() = 'admin' 
    OR (public.get_user_role() = 'editor' AND author_id = auth.uid())
  );

CREATE POLICY "Only admins can delete articles"
  ON public.articles FOR DELETE USING (public.get_user_role() = 'admin');

-- ARTICLE_TAGS
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Article tags are viewable by everyone"
  ON public.article_tags FOR SELECT USING (true);

CREATE POLICY "Admins and editors can manage article tags"
  ON public.article_tags FOR ALL USING (public.get_user_role() IN ('admin', 'editor'));

-- PAGES
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published pages are viewable by everyone"
  ON public.pages FOR SELECT USING (
    is_published = TRUE 
    OR (auth.uid() IS NOT NULL AND public.get_user_role() IN ('admin', 'editor'))
  );

CREATE POLICY "Admins can manage pages"
  ON public.pages FOR ALL USING (public.get_user_role() = 'admin');

-- SITE_SETTINGS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings are viewable by everyone"
  ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Only admins can update settings"
  ON public.site_settings FOR UPDATE USING (public.get_user_role() = 'admin');

-- NEWSLETTER
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to newsletter"
  ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view subscribers"
  ON public.newsletter_subscribers FOR SELECT USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can manage subscribers"
  ON public.newsletter_subscribers FOR ALL USING (public.get_user_role() = 'admin');

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- SEED DATA: Default Categories
-- ============================================
INSERT INTO public.categories (slug, name_es, name_en, color, icon, sort_order) VALUES
  ('cultura', 'Cultura', 'Culture', '#6c5ce7', 'palette', 1),
  ('moda', 'Moda', 'Fashion', '#e63946', 'shirt', 2),
  ('lifestyle', 'Lifestyle', 'Lifestyle', '#00b894', 'heart', 3),
  ('entretenimiento', 'Entretenimiento', 'Entertainment', '#fdcb6e', 'film', 4),
  ('opinion', 'Opinión', 'Opinion', '#0984e3', 'message-circle', 5),
  ('entrevistas', 'Entrevistas', 'Interviews', '#d63031', 'mic', 6);

-- ============================================
-- STORAGE BUCKET (run in Supabase Dashboard or via API)
-- ============================================
-- NOTE: Create a public bucket called 'media' in Supabase Storage
-- with the following policy:
-- SELECT: public access (anyone can read)
-- INSERT: authenticated users with admin/editor role
-- DELETE: authenticated users with admin/editor role
