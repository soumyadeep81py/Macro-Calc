import { createClient } from '@supabase/supabase-js';

process.loadEnvFile('.env.local');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing Supabase Insert...');
  
  // Try to authenticate with an existing user or just use anon key
  // We can just try to SELECT first to see if logs exist
  console.log('Fetching logs...');
  const { data: logs, error: fetchError } = await supabase.from('food_logs').select('*').limit(1);
  if (fetchError) console.error('Fetch Error:', fetchError);
  else console.log('Fetch Success:', logs);

  if (logs && logs.length > 0) {
    const userId = logs[0].user_id;
    console.log('Found user id:', userId);
    
    // Attempt to insert without auth (just anon key)
    const { error: insertError } = await supabase.from('food_logs').insert({
      user_id: userId,
      food_name: 'test_food',
      weight_grams: 100,
      calories: 100,
      protein: 10,
      carbs: 10,
      fat: 10,
      date: new Date().toISOString().slice(0, 10),
    });

    if (insertError) {
      console.error('Insert Error:', insertError);
    } else {
      console.log('Insert Success!');
    }
  } else {
    console.log('No logs found, trying custom_foods to get an auth user_id...');
    const { data: users, error: userError } = await supabase.from('profiles').select('*').limit(1);
    
    if (userError) {
      console.error('Profiles Fetch Error:', userError);
    } else if (users && users.length > 0) {
      const userId = users[0].id;
      console.log('Found user id from profiles:', userId);
      const { error: insertError } = await supabase.from('food_logs').insert({
        user_id: userId,
        food_name: 'test_food',
        weight_grams: 100,
        calories: 100,
        date: new Date().toISOString().slice(0, 10),
      });

      if (insertError) {
        console.error('Insert Error:', insertError);
      } else {
        console.log('Insert Success!');
      }
    } else {
      console.log('No users found.');
    }
  }

}

test();
