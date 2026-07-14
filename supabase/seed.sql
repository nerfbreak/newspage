-- Seed: first admin user setup guide
-- Run this AFTER creating your first user via Supabase Auth (email/password)
-- Replace the UUID below with your actual auth user ID from auth.users

-- Step 1: Get your user ID from Supabase Dashboard → Auth → Users
-- Step 2: Replace '<YOUR_USER_UUID>' with the actual UUID
-- Step 3: Run this in the SQL Editor

UPDATE public.profiles
SET
  full_name = 'Admin',
  role = 'admin'
WHERE id = '<YOUR_USER_UUID>';

-- Verify:
-- SELECT id, full_name, role FROM public.profiles;

-- Optional: Insert default settings
INSERT INTO public.automation_settings (key, value, is_secret) VALUES
  ('worker_offline_threshold_minutes', '5', false),
  ('worker_webhook_url', '""', false),
  ('app_version', '"1.0.0"', false)
ON CONFLICT (key) DO NOTHING;
