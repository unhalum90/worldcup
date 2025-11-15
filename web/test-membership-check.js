// Test script to verify membership check works with service role key
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testMembershipCheck() {
  const userId = 'a5974b16-ade2-4721-a0ba-67cf48eab0cc'; // The test user ID from the screenshot
  
  console.log('🔍 Testing membership check...\n');
  
  // Test 1: With anon key (like old middleware)
  console.log('Test 1: Using ANON key (subject to RLS)');
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  const { data: anonData, error: anonError } = await anonClient
    .from('profiles')
    .select('is_member, account_level, subscription_tier, subscription_status, email')
    .eq('user_id', userId)
    .maybeSingle();
  
  console.log('  Result:', { data: anonData, error: anonError?.message });
  console.log('  Can read profile?', !!anonData);
  console.log('');
  
  // Test 2: With service role key (like new middleware)
  console.log('Test 2: Using SERVICE ROLE key (bypasses RLS)');
  const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    { auth: { persistSession: false } }
  );
  
  const { data: serviceData, error: serviceError } = await serviceClient
    .from('profiles')
    .select('is_member, account_level, subscription_tier, subscription_status, email')
    .eq('user_id', userId)
    .maybeSingle();
  
  console.log('  Result:', { data: serviceData, error: serviceError?.message });
  console.log('  Can read profile?', !!serviceData);
  console.log('');
  
  // Test 3: Check membership logic
  if (serviceData) {
    console.log('Test 3: Membership determination logic');
    const isMember = (
      serviceData.is_member === true ||
      serviceData.account_level === 'member' ||
      (['premium', 'pro'].includes(serviceData.subscription_tier) && serviceData.subscription_status !== 'expired')
    );
    console.log('  is_member flag:', serviceData.is_member);
    console.log('  account_level:', serviceData.account_level);
    console.log('  subscription_tier:', serviceData.subscription_tier);
    console.log('  subscription_status:', serviceData.subscription_status);
    console.log('  ✅ Should allow access?', isMember);
  }
  
  console.log('\n✨ Test complete!');
}

testMembershipCheck().catch(console.error);
