const https = require('https');

const SUPABASE_URL = 'https://qlwoepuxomoanzvipeok.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsd29lcHV4b21vYW56dmlwZW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMTMzMzUsImV4cCI6MjA5NTY4OTMzNX0.HTt_L1rZEQvqvAtTBG6Aaht9N4ZolSF_ntsWVIa9vX0';

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = `${SUPABASE_URL}${path}`;
    const options = {
      method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      }
    };
    
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });
    
    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function main() {
  console.log('Querying pg_policies...');
  // We can query pg_catalog tables via PostgREST if exposed, but usually pg_policies is not exposed.
  // Let's try anyway.
  const res = await makeRequest('/rest/v1/pg_policies?select=*');
  console.log('Status Code:', res.statusCode);
  if (res.statusCode === 200) {
    console.log('Policies:', JSON.stringify(res.body, null, 2));
  } else {
    console.log('Could not query pg_policies directly via PostgREST (expected behavior for security).');
  }
}

main().catch(console.error);
