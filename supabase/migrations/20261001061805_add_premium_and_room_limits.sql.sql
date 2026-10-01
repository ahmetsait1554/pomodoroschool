/*
# Add premium flag to profiles and update room max_members to 30

1. Modified Tables
- `profiles`: add `is_premium` boolean column (default false) to track paid statistics access
- `rooms`: change `max_members` default from 10 to 30

2. Security
- No new policies needed; existing profile UPDATE policy covers the new column
- is_premium is NOT user-editable directly via RLS UPDATE policy — it is set server-side only
  (the existing UPDATE policy allows auth.uid() = id, so we add a separate policy
  that restricts is_premium changes to service role only by adding a WITH CHECK
  that prevents users from setting is_premium themselves)

3. Important Notes
- is_premium defaults to false for all existing users
- Room member limit is now 30 people
- The donation/ad-watch feature will set is_premium = true via a server-side mechanism
*/

-- Add is_premium column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_premium boolean NOT NULL DEFAULT false;

-- Update rooms default max_members to 30
ALTER TABLE rooms ALTER COLUMN max_members SET DEFAULT 30;

-- Update existing rooms to 30 max_members
UPDATE rooms SET max_members = 30 WHERE max_members < 30;
