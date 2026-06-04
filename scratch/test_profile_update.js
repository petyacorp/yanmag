const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://qlwoepuxomoanzvipeok.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsd29lcHV4b21vYW56dmlwZW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMTMzMzUsImV4cCI6MjA5NTY4OTMzNX0.HTt_L1rZEQvqvAtTBG6Aaht9N4ZolSF_ntsWVIa9vX0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  const email = 'testuser_23373@gmail.com';
  const password = 'TestPassword123!';
  
  console.log(`1. Signing in test user: ${email}...`);
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) {
    console.error('Sign in failed:', signInError);
    return;
  }
  
  const user = signInData.user;
  console.log('Sign in succeeded. User ID:', user.id);

  console.log('2. Trying to update profile...');
  const { data: updateData, error: updateError } = await supabase
    .from('profiles')
    .update({
      full_name: 'Test Pseudonym',
      avatar_url: 'https://example.com/avatar.png',
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single();

  if (updateError) {
    console.error('Update failed! Database Error Details:');
    console.error(JSON.stringify(updateError, null, 2));
  } else {
    console.log('Update succeeded! Response data:', updateData);
  }
}

main().catch(console.error);
