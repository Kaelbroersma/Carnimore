/*
  # Initial Database Schema and Data

  1. New Tables
    - users: Store customer and admin user data
    - categories: Product categories
    - products: Product information
    - product_images: Product image gallery
    - orders: Customer orders
    - order_items: Individual items in orders
    - payments: Payment information
    - payment_logs: eProcessingNetwork integration logs
    - reviews: Product reviews
    - shopping_cart: User shopping cart
    - coupons: Discount codes
    - wishlist: User wishlists

  2. Security
    - Enable RLS on all tables
    - Add policies for data access
    - Secure sensitive information

  3. Initial Data
    - Insert categories
    - Insert products with specifications and options
    - Insert product images
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone_number TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  user_role TEXT NOT NULL CHECK (user_role IN ('customer', 'admin')),
  account_created_date TIMESTAMPTZ DEFAULT NOW(),
  account_status TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'deleted')),
  last_login TIMESTAMPTZ
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  category_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  parent_category_id UUID REFERENCES categories(category_id),
  category_status TEXT NOT NULL DEFAULT 'active' CHECK (category_status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  product_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  category_id UUID REFERENCES categories(category_id),
  brand TEXT,
  product_status TEXT NOT NULL DEFAULT 'available' CHECK (product_status IN ('available', 'out of stock', 'discontinued')),
  added_date TIMESTAMPTZ DEFAULT NOW(),
  specifications JSONB,
  options JSONB,
  weight TEXT
);

-- Product Images Table
CREATE TABLE IF NOT EXISTS product_images (
  image_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(product_id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_main_image BOOLEAN DEFAULT false,
  image_order INTEGER NOT NULL DEFAULT 0
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  order_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id),
  order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'shipped', 'delivered', 'canceled')),
  total_amount NUMERIC NOT NULL CHECK (total_amount >= 0),
  shipping_address TEXT NOT NULL,
  order_date TIMESTAMPTZ DEFAULT NOW(),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending', 'failed')),
  shipping_method TEXT NOT NULL,
  tracking_number TEXT,
  payment_method TEXT NOT NULL
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  order_item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(product_id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_time_of_order NUMERIC NOT NULL CHECK (price_at_time_of_order >= 0),
  total_price NUMERIC NOT NULL CHECK (total_price >= 0)
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(order_id),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('credit_card', 'paypal', 'bank_transfer')),
  payment_status TEXT NOT NULL CHECK (payment_status IN ('success', 'failure')),
  amount_paid NUMERIC NOT NULL CHECK (amount_paid >= 0),
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  transaction_id TEXT UNIQUE NOT NULL
);

-- Payment Logs Table
CREATE TABLE IF NOT EXISTS payment_logs (
  log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(order_id),
  payment_id UUID REFERENCES payments(payment_id),
  transaction_id TEXT UNIQUE NOT NULL,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'completed', 'failed', 'reversed')),
  processor_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  error_message TEXT
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  review_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id),
  product_id UUID REFERENCES products(product_id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  review_date TIMESTAMPTZ DEFAULT NOW()
);

-- Shopping Cart Table
CREATE TABLE IF NOT EXISTS shopping_cart (
  cart_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id),
  product_id UUID REFERENCES products(product_id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  date_added TIMESTAMPTZ DEFAULT NOW()
);

-- Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  coupon_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  minimum_order_value NUMERIC,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired'))
);

-- Wishlist Table
CREATE TABLE IF NOT EXISTS wishlist (
  wishlist_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id),
  product_id UUID REFERENCES products(product_id),
  added_date TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_order ON payment_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_shopping_cart_user ON shopping_cart(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);

-- Enable Row Level Security
DO $$ 
BEGIN
  ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
  ALTER TABLE products ENABLE ROW LEVEL SECURITY;
  ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
  ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
  ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
  ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
  ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;
  ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
  ALTER TABLE shopping_cart ENABLE ROW LEVEL SECURITY;
  ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
  ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
EXCEPTION 
  WHEN others THEN NULL;
END $$;

-- Create RLS policies
DO $$ 
BEGIN
  -- Drop existing policies to avoid conflicts
  DROP POLICY IF EXISTS "Users can read own data" ON users;
  DROP POLICY IF EXISTS "Anyone can read products" ON products;
  DROP POLICY IF EXISTS "Anyone can read categories" ON categories;
  DROP POLICY IF EXISTS "Users can read own orders" ON orders;
  DROP POLICY IF EXISTS "Users can manage own cart" ON shopping_cart;
  DROP POLICY IF EXISTS "Users can manage own wishlist" ON wishlist;
  DROP POLICY IF EXISTS "Users can read all reviews" ON reviews;
  DROP POLICY IF EXISTS "Users can create own reviews" ON reviews;

  -- Create new policies
  CREATE POLICY "Users can read own data" ON users
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Anyone can read products" ON products
    FOR SELECT TO anon, authenticated
    USING (true);

  CREATE POLICY "Anyone can read categories" ON categories
    FOR SELECT TO anon, authenticated
    USING (true);

  CREATE POLICY "Users can read own orders" ON orders
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can manage own cart" ON shopping_cart
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can manage own wishlist" ON wishlist
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can read all reviews" ON reviews
    FOR SELECT TO anon, authenticated
    USING (true);

  CREATE POLICY "Users can create own reviews" ON reviews
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);
EXCEPTION 
  WHEN others THEN NULL;
END $$;

-- Insert initial categories
INSERT INTO categories (name, description, category_status) VALUES
('Carnimore Models', 'Premium custom rifles crafted with precision', 'active'),
('Merch', 'Official Carnimore merchandise and apparel', 'active'),
('Duracoat Services', 'Professional firearm coating services', 'active'),
('Optics', 'High-quality scopes and sighting solutions', 'active'),
('Accessories', 'Essential firearm accessories and components', 'active')
ON CONFLICT DO NOTHING;

-- Insert Products and Images
DO $$ 
BEGIN
  -- Delete existing data first to prevent duplicates
  DELETE FROM product_images;
  DELETE FROM products;

  -- Insert Carnimore Models
  INSERT INTO products (
    name,
    description,
    price,
    stock_quantity,
    category_id,
    brand,
    specifications,
    options,
    weight
  ) 
  SELECT
    p.name,
    p.description,
    p.price,
    p.stock_quantity,
    c.category_id,
    p.brand,
    p.specifications,
    p.options,
    p.weight
  FROM (
    VALUES
      (
        'El Carbone',
        'Premium carbon fiber precision rifle with custom Duracoat finish',
        4495,
        10,
        'Carnimore',
        jsonb_build_array(
          'Tikka T3x Action',
          '22" CarbonSix Sendero carbon barrel',
          'Bolt Fluting (Choice: Wrought iron or Deep Helix)',
          'AO Titanium Bolt Shroud & Knob',
          'AO Stainless Swept Bolt Handle',
          'AO 20 MOA Bubble Level Pic Rail',
          'MDT HNT26 Carbon Folding Chassis',
          'Sako/Tikka 2 lb Trigger',
          'Carnimore Custom Duracoat',
          'MDT AICS Magazine',
          'Travel Hard Case'
        ),
        jsonb_build_object(
          'longAction', true,
          'boltFluting', 'Wrought Iron',
          'availableCalibers', array[
            '300 Win',
            '30 Nosler',
            '7 PRC',
            '7mm Rem Mag',
            '6.5 PRC',
            '6.5 Creedmoor',
            '308 Win',
            '223 Rem'
          ]
        ),
        '6 lbs (before optics)'
      ),
      (
        'El Carbone Alpine',
        'Lightweight carbon fiber precision rifle with MDT carbon stock',
        3949,
        10,
        'Carnimore',
        jsonb_build_array(
          'Tikka T3x Action',
          '22" CarbonSix Sendero carbon barrel',
          'Bolt Fluting (Choice: Wrought iron or Deep Helix)',
          'AO Titanium Bolt Shroud & Knob',
          'AO Stainless Swept Bolt Handle',
          'AO 20 MOA Bubble Level Pic Rail',
          'MDT Carbon Stock',
          'Sako/Tikka 2 lb Trigger',
          'Carnimore Custom Duracoat',
          'MDT AICS Magazine',
          'Travel Hard Case'
        ),
        jsonb_build_object(
          'longAction', true,
          'boltFluting', 'Wrought Iron',
          'availableCalibers', array[
            '300 Win',
            '7mm Rem Mag',
            '6.5 PRC',
            '6.5 Creedmoor',
            '308 Win',
            '30 Nosler',
            '7 PRC'
          ]
        ),
        '6.35 lbs (before optics)'
      ),
      (
        'El Metale',
        'Precision rifle with MDT LSS chassis system',
        2495,
        10,
        'Carnimore',
        jsonb_build_array(
          'Tikka T3x Action',
          'Sako/Tikka Barrel (Threaded)',
          'AO Titanium Bolt Shroud & Knob',
          'AO Stainless Swept Bolt Handle',
          'AO 20 MOA Bubble Level Pic Rail',
          'MDT LSS Chassis',
          'Sako/Tikka 2 lb Trigger',
          'Carnimore Custom Duracoat',
          'MDT AICS Magazine',
          'Hard Case'
        ),
        jsonb_build_object(
          'longAction', true,
          'deluxeVersion', true,
          'availableCalibers', array[
            '300 Win',
            '7mm Rem Mag',
            '6.5 PRC',
            '6.5 Creedmoor',
            '308 Win',
            '223 Rem',
            '243 Win',
            '30-06 Springfield'
          ]
        ),
        '8 lbs (before optics)'
      )
  ) AS p(name, description, price, stock_quantity, brand, specifications, options, weight)
  CROSS JOIN (
    SELECT category_id FROM categories WHERE name = 'Carnimore Models'
  ) AS c;

  -- Insert Duracoat Services
  INSERT INTO products (
    name,
    description,
    price,
    stock_quantity,
    category_id,
    brand,
    specifications,
    options
  )
  SELECT
    p.name,
    p.description,
    p.price,
    p.stock_quantity,
    c.category_id,
    p.brand,
    p.specifications,
    p.options
  FROM (
    VALUES
      (
        'Handgun Duracoat',
        'Complete handgun coating with premium Duracoat finish',
        150,
        999,
        'Carnimore',
        jsonb_build_array(
          'Complete disassembly and thorough cleaning',
          'Surface preparation and degreasing',
          'Professional Duracoat application',
          'Choice of finish: Matte, Satin, or Gloss',
          'Full reassembly and function check'
        ),
        jsonb_build_object(
          'additionalColorCost', 30
        )
      ),
      (
        'Rifle Stock Duracoat',
        'Custom rifle stock coating with detailed finish',
        190,
        999,
        'Carnimore',
        jsonb_build_array(
          'Stock removal and preparation',
          'Surface texturing if desired',
          'Custom pattern application',
          'Multiple color options available',
          'Weather-resistant finish'
        ),
        jsonb_build_object(
          'additionalColorCost', 60
        )
      ),
      (
        'Rifle Complete Duracoat',
        'Full rifle coating including all components',
        300,
        999,
        'Carnimore',
        jsonb_build_array(
          'Complete rifle disassembly',
          'Thorough cleaning and preparation',
          'Custom pattern design',
          'Multiple color application',
          'Full reassembly and testing'
        ),
        jsonb_build_object(
          'additionalColorCost', 100
        )
      )
  ) AS p(name, description, price, stock_quantity, brand, specifications, options)
  CROSS JOIN (
    SELECT category_id FROM categories WHERE name = 'Duracoat Services'
  ) AS c;

  -- Insert Merch Products
  INSERT INTO products (
    name,
    description,
    price,
    stock_quantity,
    category_id,
    brand,
    options
  )
  SELECT
    p.name,
    p.description,
    p.price,
    p.stock_quantity,
    c.category_id,
    p.brand,
    p.options
  FROM (
    VALUES
      (
        'Carnimore T-Shirt (Mens)',
        'Premium cotton t-shirt with Carnimore logo',
        25,
        100,
        'Carnimore',
        jsonb_build_object(
          'sizes', array['XS', 'S', 'M', 'L', 'XL', 'XXL'],
          'colors', jsonb_build_array(
            jsonb_build_object(
              'name', 'Sage',
              'value', '#8C9A84'
            ),
            jsonb_build_object(
              'name', 'Charcoal',
              'value', '#36454F'
            ),
            jsonb_build_object(
              'name', 'Stonewashed Green',
              'value', '#78866B',
              'hasRedLogo', true
            )
          )
        )
      ),
      (
        'Carnimore T-Shirt (Womens)',
        'Fitted cotton t-shirt with Carnimore logo',
        25,
        100,
        'Carnimore',
        jsonb_build_object(
          'sizes', array['XS', 'S', 'M', 'L', 'XL'],
          'colors', jsonb_build_array(
            jsonb_build_object(
              'name', 'Charcoal',
              'value', '#36454F'
            ),
            jsonb_build_object(
              'name', 'Stonewashed Green',
              'value', '#78866B',
              'hasRedLogo', true
            )
          )
        )
      ),
      (
        'Carnimore Beanie',
        'Warm and comfortable beanie with embroidered Carnimore logo',
        25,
        100,
        'Carnimore',
        jsonb_build_object(
          'colors', jsonb_build_array(
            jsonb_build_object(
              'name', 'Brown',
              'value', '#8B4513'
            ),
            jsonb_build_object(
              'name', 'Grey',
              'value', '#808080'
            )
          )
        )
      )
  ) AS p(name, description, price, stock_quantity, brand, options)
  CROSS JOIN (
    SELECT category_id FROM categories WHERE name = 'Merch'
  ) AS c;

  -- Insert Product Images
  INSERT INTO product_images (product_id, image_url, is_main_image, image_order)
  SELECT 
    p.product_id,
    CASE 
      WHEN p.name = 'El Carbone' THEN '/img/gallery/DSC_0331.jpg'
      WHEN p.name = 'El Carbone Alpine' THEN '/img/gallery/DSC_0340.jpg'
      WHEN p.name = 'El Metale' THEN '/img/gallery/DSC_0319.jpg'
      WHEN p.name = 'Handgun Duracoat' THEN '/img/gallery/DSC_0319.jpg'
      WHEN p.name = 'Rifle Stock Duracoat' THEN '/img/gallery/DSC_0331.jpg'
      WHEN p.name = 'Rifle Complete Duracoat' THEN '/img/gallery/DSC_0340.jpg'
      ELSE '/img/Logo-Main.webp'
    END,
    true,
    0
  FROM products p;

  -- Insert additional images for rifles
  INSERT INTO product_images (product_id, image_url, is_main_image, image_order)
  SELECT 
    p.product_id,
    i.image_url,
    false,
    i.image_order
  FROM products p
  CROSS JOIN (
    VALUES 
      ('/img/gallery/DSC_0332.jpg', 1),
      ('/img/gallery/DSC_0334.jpg', 2),
      ('/img/gallery/DSC_0338.jpg', 3)
  ) AS i(image_url, image_order)
  WHERE EXISTS (
    SELECT 1 FROM categories c 
    WHERE c.category_id = p.category_id 
    AND c.name = 'Carnimore Models'
  );
END $$;