const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://qlwoepuxomoanzvipeok.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsd29lcHV4b21vYW56dmlwZW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMTMzMzUsImV4cCI6MjA5NTY4OTMzNX0.HTt_L1rZEQvqvAtTBG6Aaht9N4ZolSF_ntsWVIa9vX0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log('Listing all buckets...');
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  
  if (bucketsError) {
    console.error('Error listing buckets:', bucketsError);
  } else {
    console.log('Buckets list:', buckets);
  }

  console.log('\nChecking "media" bucket details...');
  const { data: bucket, error: bucketError } = await supabase.storage.getBucket('media');
  if (bucketError) {
    console.error('Error getting "media" bucket:', bucketError);
  } else {
    console.log('Bucket "media" details:', bucket);
  }

  console.log('\nTrying to list files in "media" bucket under "articles"...');
  const { data: files, error: filesError } = await supabase.storage.from('media').list('articles', { limit: 10 });
  if (filesError) {
    console.error('Error listing files in "media":', filesError);
  } else {
    console.log('Files in "media/articles":', files);
  }
}

main().catch(console.error);
