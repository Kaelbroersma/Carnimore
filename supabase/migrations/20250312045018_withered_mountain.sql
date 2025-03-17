/*
  # Add User Preferences

  1. Changes
    - Add accepted_terms column to users table
    - Add marketing_opt_in column to users table
    - Add NOT NULL constraints with default values
    - Add check constraint to ensure terms are accepted
*/

ALTER TABLE users
ADD COLUMN accepted_terms BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN marketing_opt_in BOOLEAN NOT NULL DEFAULT false;

-- Add constraint to ensure terms are accepted
ALTER TABLE users
ADD CONSTRAINT users_terms_accepted_check CHECK (accepted_terms = true);