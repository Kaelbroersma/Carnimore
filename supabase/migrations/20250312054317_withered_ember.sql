/*
  # Fix user table constraints

  1. Changes
    - Drop password_hash column as it's not needed (auth handled by Supabase Auth)
    - Ensure terms acceptance is properly enforced
*/

-- Drop password_hash column as it's not needed
ALTER TABLE users
DROP COLUMN IF EXISTS password_hash;

-- Ensure terms acceptance is properly enforced
ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_terms_accepted_check;

ALTER TABLE users
ADD CONSTRAINT users_terms_accepted_check 
CHECK (accepted_terms = true);