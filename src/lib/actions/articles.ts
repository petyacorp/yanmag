'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ArticleFormData } from '@/lib/types';

export async function getArticles(options?: {
  status?: string;
  categoryId?: string;
  authorId?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
}) {
  const supabase = await createClient();
  let query = supabase
    .from('articles')
    .select('*, category:categories(*), author:profiles(*)', { count: 'exact' });

  if (options?.status === 'published') {
    query = query.order('published_at', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  if (options?.status) {
    query = query.eq('status', options.status);
  }
  if (options?.categoryId) {
    query = query.eq('category_id', options.categoryId);
  }
  if (options?.authorId) {
    query = query.eq('author_id', options.authorId);
  }
  if (options?.featured) {
    query = query.eq('is_featured', true);
  }
  if (options?.search) {
    query = query.or(`title_es.ilike.%${options.search}%,title_en.ilike.%${options.search}%`);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { articles: data || [], count: count || 0 };
}

export async function getArticleBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('articles')
    .select('*, category:categories(*), author:profiles(*)')
    .eq('slug', slug)
    .single();

  if (error) return null;
  
  // Get tags
  const { data: articleTags } = await supabase
    .from('article_tags')
    .select('tag:tags(*)')
    .eq('article_id', data.id);

  return {
    ...data,
    tags: articleTags?.map((at: { tag: unknown }) => at.tag) || [],
  };
}

export async function getArticleById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('articles')
    .select('*, category:categories(*), author:profiles(*)')
    .eq('id', id)
    .single();

  if (error) return null;

  const { data: articleTags } = await supabase
    .from('article_tags')
    .select('tag:tags(*)')
    .eq('article_id', data.id);

  return {
    ...data,
    tags: articleTags?.map((at: { tag: unknown }) => at.tag) || [],
  };
}

export async function createArticle(formData: ArticleFormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { tag_ids, ...articleData } = formData;

  const { data, error } = await supabase
    .from('articles')
    .insert({
      ...articleData,
      author_id: user.id,
      published_at: formData.status === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) throw error;

  // Insert tags
  if (tag_ids?.length > 0) {
    await supabase
      .from('article_tags')
      .insert(tag_ids.map(tag_id => ({ article_id: data.id, tag_id })));
  }

  revalidatePath('/');
  revalidatePath('/admin/articulos');
  return data;
}

export async function updateArticle(id: string, formData: Partial<ArticleFormData>) {
  const supabase = await createClient();
  const { tag_ids, ...articleData } = formData;

  // Set published_at when first published
  if (articleData.status === 'published') {
    const existing = await getArticleById(id);
    if (existing && !existing.published_at) {
      (articleData as Record<string, unknown>).published_at = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from('articles')
    .update(articleData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Update tags if provided
  if (tag_ids !== undefined) {
    await supabase.from('article_tags').delete().eq('article_id', id);
    if (tag_ids.length > 0) {
      await supabase
        .from('article_tags')
        .insert(tag_ids.map(tag_id => ({ article_id: id, tag_id })));
    }
  }

  revalidatePath('/');
  revalidatePath('/admin/articulos');
  revalidatePath(`/articulo/${data.slug}`);
  return data;
}

export async function deleteArticle(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('articles').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/');
  revalidatePath('/admin/articulos');
}

export async function publishArticle(id: string) {
  return updateArticle(id, { status: 'published' });
}

export async function archiveArticle(id: string) {
  return updateArticle(id, { status: 'archived' });
}

export async function searchArticles(query: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('articles')
    .select('*, category:categories(*), author:profiles(*)')
    .eq('status', 'published')
    .or(`title_es.ilike.%${query}%,title_en.ilike.%${query}%,excerpt_es.ilike.%${query}%,content_es.ilike.%${query}%`)
    .order('published_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data || [];
}
