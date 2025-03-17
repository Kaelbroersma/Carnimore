/*
  # Update Image URL Handling

  1. Changes
    - Update product_images table to store relative paths
    - Update existing image URLs to use relative paths
    - Add storage bucket for product images
    - Add public access policy for product images

  2. Security
    - Enable public access to product images bucket
    - Maintain RLS on product_images table
*/

-- Update existing image URLs to use relative paths
UPDATE product_images
SET image_url = REPLACE(image_url, '/img/gallery/', '/gallery/')
WHERE image_url LIKE '/img/gallery/%';

-- Create storage bucket for product images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy to allow public access to product images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'product-images' );

-- Add index on product_images for faster lookups
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);