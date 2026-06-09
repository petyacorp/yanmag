'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { SiteSettings } from '@/lib/types';

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .limit(1)
    .single();

  if (error) return null;
  return data;
}

export async function updateSiteSettings(settings: Partial<SiteSettings>) {
  const supabase = await createClient();
  
  // Get existing settings ID
  const { data: existing } = await supabase
    .from('site_settings')
    .select('id')
    .limit(1)
    .single();

  if (!existing) throw new Error('Site settings not found');

  const { data, error } = await supabase
    .from('site_settings')
    .update(settings)
    .eq('id', existing.id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/admin/configuracion');
  return data;
}

export async function subscribeNewsletter(email: string, name?: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .upsert(
      { email, name, is_active: true, unsubscribed_at: null },
      { onConflict: 'email' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getNewsletterSubscribers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('subscribed_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function unsubscribeNewsletter(email: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('newsletter_subscribers')
    .update({ is_active: false, unsubscribed_at: new Date().toISOString() })
    .eq('email', email);

  if (error) throw error;
}

export async function getTickerItems(): Promise<{ items_es: string[]; items_en: string[] }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('site_settings')
    .select('ticker_items_es, ticker_items_en')
    .limit(1)
    .single();

  if (error || !data) {
    return { items_es: [], items_en: [] };
  }

  return {
    items_es: (data.ticker_items_es as string[]) || [],
    items_en: (data.ticker_items_en as string[]) || [],
  };
}

export async function updateTickerItems(items_es: string[], items_en: string[]) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('site_settings')
    .select('id')
    .limit(1)
    .single();

  if (!existing) throw new Error('Site settings not found');

  const { data, error } = await supabase
    .from('site_settings')
    .update({
      ticker_items_es: items_es,
      ticker_items_en: items_en,
    })
    .eq('id', existing.id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/');
  revalidatePath('/admin');
  return data;
}
