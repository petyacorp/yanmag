const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://qlwoepuxomoanzvipeok.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsd29lcHV4b21vYW56dmlwZW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMTMzMzUsImV4cCI6MjA5NTY4OTMzNX0.HTt_L1rZEQvqvAtTBG6Aaht9N4ZolSF_ntsWVIa9vX0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log('--- STARTING FOLDER TEST ---');
  
  // 1. List current contents of "articles"
  console.log('\nListing current articles folder:');
  const { data: initialData, error: initialError } = await supabase.storage
    .from('media')
    .list('articles');
  
  if (initialError) {
    console.error('List error:', initialError);
    return;
  }
  console.log('Initial contents:', initialData);

  // 2. Try uploading a .keep file to create a folder "articles/TestFolder"
  const folderPath = 'articles/TestFolder/.keep';
  console.log(`\nUploading empty .keep to "${folderPath}":`);
  
  const blob = Buffer.from('');
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('media')
    .upload(folderPath, blob, {
      contentType: 'text/plain',
      upsert: true
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
  } else {
    console.log('Upload success:', uploadData);
  }

  // 3. List articles folder again
  console.log('\nListing articles folder after creation:');
  const { data: finalData, error: finalError } = await supabase.storage
    .from('media')
    .list('articles');
  
  if (finalError) {
    console.error('Final list error:', finalError);
    return;
  }
  console.log('Final contents:', finalData);

  // 4. Cleanup: delete the .keep file
  if (!uploadError) {
    console.log('\nCleaning up - deleting test file:');
    const { error: deleteError } = await supabase.storage
      .from('media')
      .remove([folderPath]);
    if (deleteError) console.error('Delete error:', deleteError);
    else console.log('Cleanup successful!');
  }
}

main().catch(console.error);
