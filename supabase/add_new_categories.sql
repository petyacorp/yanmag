-- ============================================
-- YAN MAG — Add Music, Video Games and Cinema & TV Categories
-- ============================================
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor)
-- to add the new categories into the database.
-- ============================================

INSERT INTO public.categories (slug, name_es, name_en, color, icon, sort_order) 
VALUES ('musica', 'Música', 'Music', '#ff7675', 'music', 7)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (slug, name_es, name_en, color, icon, sort_order) 
VALUES ('videojuegos', 'Videojuegos', 'Video Games', '#74b9ff', 'gamepad-2', 8)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (slug, name_es, name_en, color, icon, sort_order) 
VALUES ('cine-tv', 'Cine & TV', 'Cinema & TV', '#a29bfe', 'film', 9)
ON CONFLICT (slug) DO NOTHING;
