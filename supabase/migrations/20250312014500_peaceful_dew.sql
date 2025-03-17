-- Add options column to shopping_cart table
ALTER TABLE shopping_cart
ADD COLUMN IF NOT EXISTS options JSONB;

COMMENT ON COLUMN shopping_cart.options IS 'Stores product customization options like caliber, colors, size, etc.';

-- Add storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy to allow public access to product images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'product-images' );