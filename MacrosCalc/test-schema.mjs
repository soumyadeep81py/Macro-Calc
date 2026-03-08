import { createClient } from '@supabase/supabase-js';

process.loadEnvFile('.env.local');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSchema() {
  console.log('Registering dummy user...');
  const email = `test_${Date.now()}@example.com`;
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: 'password123'
  });

  if (authError) {
    console.error('Signup Error:', authError.message);
    if (authError.message === 'Database error saving new user') {
      console.error('Wait, might be a trigger issue on profiles table.');
    }
  }

  const user = authData?.user;
  if (!user) {
    console.error('Failed to get user');
    process.exit(1);
  }

  console.log('User registered:', user.id);

  console.log('Attempting insert into food_logs...');
  const { error: insertError } = await supabase.from('food_logs').insert({
    user_id: user.id,
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
}

testSchema();
