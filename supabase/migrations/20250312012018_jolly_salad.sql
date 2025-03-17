/*
  # Add options column to order_items table

  1. Changes
    - Add options JSONB column to order_items table to store product customization options
    - Ensure backward compatibility with existing records
*/

ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS options JSONB;

COMMENT ON COLUMN order_items.options IS 'Stores product customization options like caliber, colors, size, etc.';