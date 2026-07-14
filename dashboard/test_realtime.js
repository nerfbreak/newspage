const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

console.log('Connecting to Supabase...');

const channel = supabase.channel('test-channel')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'automation_jobs' }, (payload) => {
    console.log('JOB CHANGE RECEIVED:', payload);
  })
  .on('postgres_changes', { event: '*', schema: 'public', table: 'automation_logs' }, (payload) => {
    console.log('LOG CHANGE RECEIVED:', payload);
  })
  .subscribe((status, err) => {
    console.log('SUBSCRIBE STATUS:', status, err);
  });

setTimeout(() => {
  console.log('Script running for 10 seconds, waiting for events...');
}, 10000);
