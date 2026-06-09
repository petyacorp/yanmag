const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://qlwoepuxomoanzvipeok.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsd29lcHV4b21vYW56dmlwZW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMTMzMzUsImV4cCI6MjA5NTY4OTMzNX0.HTt_L1rZEQvqvAtTBG6Aaht9N4ZolSF_ntsWVIa9vX0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log('1. Checking articles table schema...');
  const { data: articles, error: articlesError } = await supabase
    .from('articles')
    .select('id, featured_position')
    .limit(1);

  if (articlesError) {
    console.error('Error querying articles.featured_position:', articlesError.message);
  } else {
    console.log('Success: articles.featured_position is available!', articles);
  }

  console.log('\n2. Checking site_settings table schema...');
  const { data: settings, error: settingsError } = await supabase
    .from('site_settings')
    .select('id, ticker_items_es, ticker_items_en')
    .limit(1);

  if (settingsError) {
    console.error('Error querying site_settings ticker columns:', settingsError.message);
  } else {
    console.log('Success: site_settings ticker columns are available!', settings);
  }
}

main().catch(console.error);
