/*
  # Add options column to shopping_cart table

  1. Changes
    - Add options JSONB column to shopping_cart table to store product customization options
    - Ensure backward compatibility with existing records
*/

ALTER TABLE shopping_cart
ADD COLUMN IF NOT EXISTS options JSONB;

COMMENT ON COLUMN shopping_cart.options IS 'Stores product customization options like caliber, colors, size, etc.';