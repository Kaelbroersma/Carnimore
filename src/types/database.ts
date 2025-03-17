export interface Category {
  category_id: string;
  name: string;
  description: string | null;
  parent_category_id: string | null;
  category_status: 'active' | 'inactive';
  created_at: string;
  slug: string;
}

export interface Product {
  product_id: string;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  category_id: string;
  brand: string | null;
  product_status: 'available' | 'out of stock' | 'discontinued';
  added_date: string;
  specifications: string[] | null;
  options: {
    // Carnimore Models options
    availableCalibers?: string[];
    
    // Duracoat options
    additionalColorCost?: number;
    maxColors?: number;
    prepChargeRequired?: boolean;
    basePrepCharge?: number;
    additionalPrepCharge?: number;
    
    // Merch options
    sizes?: string[];
    colors?: Array<{
      name: string;
      value: string;
      hasRedLogo?: boolean;
    }>;
  } | null;
  weight: string | null;
  images?: ProductImage[];
  slug: string;
}

export interface ProductImage {
  image_id: string;
  product_id: string;
  image_url: string;
  is_main_image: boolean;
  image_order: number;
}

export interface DatabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export type Result<T> = {
  data: T | null;
  error: DatabaseError | null;
};