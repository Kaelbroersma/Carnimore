/*
  # Make non-essential user fields nullable
  
  1. Changes
    - Make address and contact fields nullable
    - Keep only essential fields as NOT NULL
    - Ensure backward compatibility
*/

-- Make non-essential fields nullable
ALTER TABLE users
ALTER COLUMN password_hash DROP NOT NULL,
ALTER COLUMN phone_number DROP NOT NULL,
ALTER COLUMN address_line1 DROP NOT NULL,
ALTER COLUMN address_line2 DROP NOT NULL,
ALTER COLUMN city DROP NOT NULL,
ALTER COLUMN state DROP NOT NULL,
ALTER COLUMN country DROP NOT NULL,
ALTER COLUMN postal_code DROP NOT NULL;

-- Keep essential fields as NOT NULL
ALTER TABLE users
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN last_name SET NOT NULL,
ALTER COLUMN email SET NOT NULL,
ALTER COLUMN user_role SET NOT NULL,
ALTER COLUMN account_status SET NOT NULL,
ALTER COLUMN accepted_terms SET NOT NULL;