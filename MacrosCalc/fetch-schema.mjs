import * as fs from 'fs';

process.loadEnvFile('.env.local');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function checkSchema() {
  const url = `${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`;
  console.log('Fetching OpenAPI spec from:', url);
  try {
    const res = await fetch(url);
    const json = await res.json();
    const foodLogsDef = json.definitions?.food_logs;
    if (foodLogsDef) {
      console.log('food_logs columns:', Object.keys(foodLogsDef.properties));
    } else {
      console.log('food_logs definition not found in OpenAPI spec.');
      console.log('Available tables:', Object.keys(json.definitions || {}));
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

checkSchema();
