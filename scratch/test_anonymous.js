const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://qlwoepuxomoanzvipeok.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsd29lcHV4b21vYW56dmlwZW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMTMzMzUsImV4cCI6MjA5NTY4OTMzNX0.HTt_L1rZEQvqvAtTBG6Aaht9N4ZolSF_ntsWVIa9vX0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log('Attempting anonymous sign in...');
  const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
  
  if (authError) {
    console.error('Anonymous sign in failed:', authError);
    return;
  }
  
  const user = authData.user;
  console.log('Anonymous sign in succeeded. User ID:', user.id);
  
  // Wait a moment for trigger to run
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('Trying to update profile...');
  const { data: updateData, error: updateError } = await supabase
    .from('profiles')
    .update({
      full_name: 'Test Anonymous Name',
      avatar_url: 'https://example.com/anon-avatar.png',
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single();

  if (updateError) {
    console.error('Update failed! Details:', JSON.stringify(updateError, null, 2));
  } else {
    console.log('Update succeeded! Response:', updateData);
  }
}

main().catch(console.error);
