// ============================================
// YAN MAG — Utility Functions
// ============================================

import { type Locale } from './types';

/**
 * Generate a URL-friendly slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Format a date for display
 */
export function formatDate(date: string | Date, locale: Locale = 'es'): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a relative time (e.g., "hace 3 horas")
 */
export function formatRelativeTime(date: string | Date, locale: Locale = 'es'): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (locale === 'es') {
    if (diffSecs < 60) return 'hace un momento';
    if (diffMins < 60) return `hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    if (diffHours < 24) return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    if (diffDays < 7) return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    return formatDate(date, locale);
  } else {
    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    return formatDate(date, locale);
  }
}

/**
 * Truncate text to a max length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
}

/**
 * Calculate reading time in minutes
 */
export function readingTime(content: string, locale: Locale = 'es'): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  if (locale === 'es') {
    return `${minutes} min de lectura`;
  }
  return `${minutes} min read`;
}

/**
 * Merge class names (simple cn utility)
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get Supabase Storage public URL for a file
 */
export function getStorageUrl(path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || !path) return '';
  return `${supabaseUrl}/storage/v1/object/public/media/${path}`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Generate excerpt from content (strip markdown)
 */
export function generateExcerpt(content: string, maxLength: number = 160): string {
  const stripped = content
    .replace(/#{1,6}\s/g, '')      // Remove headings
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1')     // Remove italic
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
    .replace(/!\[.*?\]\(.*?\)/g, '')  // Remove images
    .replace(/`(.*?)`/g, '$1')       // Remove inline code
    .replace(/\n+/g, ' ')           // Replace newlines
    .trim();
  return truncate(stripped, maxLength);
}
