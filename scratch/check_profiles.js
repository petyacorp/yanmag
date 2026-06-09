const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://qlwoepuxomoanzvipeok.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsd29lcHV4b21vYW56dmlwZW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMTMzMzUsImV4cCI6MjA5NTY4OTMzNX0.HTt_L1rZEQvqvAtTBG6Aaht9N4ZolSF_ntsWVIa9vX0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log('Querying profiles table...');
  const { data, error } = await supabase
    .from('profiles')
    .select('*');

  if (error) {
    console.error('Error querying profiles:', error);
  } else {
    console.log('Profiles in DB:', data);
  }
}

main().catch(console.error);
