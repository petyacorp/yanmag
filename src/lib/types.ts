// ============================================
// YAN MAG — TypeScript Types
// ============================================

export type UserRole = 'admin' | 'editor' | 'viewer';
export type ArticleStatus = 'draft' | 'review' | 'published' | 'archived';
export type Locale = 'es' | 'en';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  slug: string;
  name_es: string;
  name_en: string | null;
  description_es: string | null;
  description_en: string | null;
  color: string;
  icon: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  slug: string;
  name_es: string;
  name_en: string | null;
  created_at: string;
}

export type FeaturedPosition = 'carousel' | 'hero_featured' | null;

export interface Article {
  id: string;
  slug: string;
  title_es: string;
  excerpt_es: string | null;
  content_es: string | null;
  title_en: string | null;
  excerpt_en: string | null;
  content_en: string | null;
  cover_image: string | null;
  cover_image_alt: string | null;
  category_id: string | null;
  author_id: string | null;
  status: ArticleStatus;
  is_featured: boolean;
  featured_position: FeaturedPosition;
  meta_title: string | null;
  meta_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations
  category?: Category;
  author?: Profile;
  tags?: Tag[];
}

export interface Page {
  id: string;
  slug: string;
  title_es: string;
  title_en: string | null;
  content_es: string | null;
  content_en: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: string;
  site_name: string;
  tagline_es: string | null;
  tagline_en: string | null;
  description_es: string | null;
  description_en: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  social_instagram: string | null;
  social_twitter: string | null;
  social_facebook: string | null;
  social_tiktok: string | null;
  social_youtube: string | null;
  default_meta_title: string | null;
  default_meta_description: string | null;
  google_analytics_id: string | null;
  ticker_items_es: string[] | null;
  ticker_items_en: string[] | null;
  quote_author: string | null;
  updated_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name: string | null;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export type DashboardTaskStatus = 'pending' | 'in_progress' | 'completed';

export interface DashboardTask {
  id: string;
  title: string;
  status: DashboardTaskStatus;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Helper types for forms
export interface ArticleFormData {
  title_es: string;
  title_en: string;
  excerpt_es: string;
  excerpt_en: string;
  content_es: string;
  content_en: string;
  slug: string;
  category_id: string;
  tag_ids: string[];
  cover_image: string;
  cover_image_alt: string;
  is_featured: boolean;
  meta_title: string;
  meta_description: string;
  status: ArticleStatus;
}

export interface CategoryFormData {
  name_es: string;
  name_en: string;
  slug: string;
  description_es: string;
  description_en: string;
  color: string;
  icon: string;
}

// Localized content helper
export function getLocalized<T extends { [key: string]: unknown }>(
  item: T,
  field: string,
  locale: Locale = 'es'
): string {
  const localizedField = `${field}_${locale}` as keyof T;
  const fallbackField = `${field}_es` as keyof T;
  return (item[localizedField] as string) || (item[fallbackField] as string) || '';
}
