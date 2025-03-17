import { createClient } from '@supabase/supabase-js';
import { Handler } from '@netlify/functions';

// Validate environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing required environment variables: SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY');
}

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  try {
    if (!event.body) {
      throw new Error('Missing request body');
    }

    const { action, payload } = JSON.parse(event.body);

    if (!action) {
      throw new Error('Missing required action parameter');
    }

    console.log(`Processing action: ${action}`);

    switch (action) {
      case 'signUp':
        try {
          // Validate required fields
          if (!payload.email || !payload.password || !payload.options?.data?.first_name || !payload.options?.data?.last_name) {
            throw new Error('Missing required fields for signup');
          }

          // Create auth user first
          const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
            email: payload.email,
            password: payload.password,
            email_confirm: true,
            user_metadata: {
              first_name: payload.options.data.first_name,
              last_name: payload.options.data.last_name,
              acceptedTerms: true
            }
          });

          if (signUpError) throw signUpError;
          if (!signUpData.user) throw new Error('Failed to create user');

          // Insert into users table
          const { error: userError } = await supabase
            .from('users')
            .insert([{
              user_id: signUpData.user.id,
              email: payload.email,
              first_name: payload.options.data.first_name,
              last_name: payload.options.data.last_name,
              user_role: 'customer',
              account_status: 'active',
              accepted_terms: true,
              marketing_opt_in: payload.options.data.acceptMarketing || false
            }]);

          if (userError) {
            console.error('Error creating user record:', userError);
            await supabase.auth.admin.deleteUser(signUpData.user.id);
            throw userError;
          }

          // Sign in the user immediately after signup
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: payload.email,
            password: payload.password
          });

          if (signInError) throw signInError;

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ data: signInData })
          };
        } catch (error: any) {
          console.error('Error in signup process:', error);
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ 
              error: { 
                message: error.message || 'Failed to sign up',
                details: error.details || error.message
              }
            })
          };
        }

      case 'signIn':
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword(payload);
        if (signInError) throw signInError;

        // Update last_login in users table
        if (signInData.user) {
          await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('user_id', signInData.user.id);
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ data: signInData })
        };

      case 'signOut':
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) throw signOutError;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true })
        };

      case 'getSession':
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ data: session })
        };

      case 'getProducts':
        try {
          if (!payload.categorySlug) {
            throw new Error('Missing category slug');
          }

          // First get the category ID
          const { data: category, error: categoryError } = await supabase
            .from('categories')
            .select('category_id')
            .eq('slug', payload.categorySlug)
            .single();

          if (categoryError) {
            console.error('Category error:', categoryError);
            throw new Error(`Category not found: ${payload.categorySlug}`);
          }

          // Then get the products for that category
          const { data: products, error: productsError } = await supabase
            .from('products')
            .select(`
              *,
              images:product_images(
                image_id,
                image_url,
                is_main_image,
                image_order
              )
            `)
            .eq('category_id', category.category_id)
            .eq('product_status', 'available')
            .order('name');

          if (productsError) {
            console.error('Products error:', productsError);
            throw productsError;
          }

          // Sort images for each product
          const sortedProducts = products.map(product => ({
            ...product,
            images: product.images?.sort((a, b) => a.image_order - b.image_order)
          }));

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ data: sortedProducts })
          };
        } catch (error: any) {
          console.error('Error in getProducts:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
              error: { 
                message: 'Failed to fetch products',
                details: error.message
              }
            })
          };
        }

      case 'getProduct':
        if (!payload.productSlug) {
          throw new Error('Missing product slug');
        }

        const { data: product, error: productError } = await supabase
          .from('products')
          .select(`
            *,
            images:product_images(
              image_id,
              image_url,
              is_main_image,
              image_order
            )
          `)
          .eq('slug', payload.productSlug)
          .single();

        if (productError) throw productError;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ data: product })
        };

      case 'getCategories':
        const { data: categories, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('category_status', 'active')
          .order('name');

        if (categoriesError) throw categoriesError;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ data: categories })
        };

      case 'getCart':
        if (!payload.userId) {
          throw new Error('Missing user ID');
        }

        console.log('Fetching cart for user:', payload.userId);

        const { data: cart, error: cartError } = await supabase
          .from('shopping_cart')
          .select('items, total_value')
          .eq('user_id', payload.userId)
          .single();

        if (cartError) {
          // Handle "no rows returned" differently than other errors
          if (cartError.code === 'PGRST116') {
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({ 
                data: {
                  items: [],
                  total_value: 0
                }
              })
            };
          }
          throw cartError;
        }

        console.log('Cart data retrieved:', cart);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            data: {
              items: cart?.items || [],
              total_value: cart?.total_value || 0
            }
          })
        };

      case 'updateCart':
        if (!payload.userId || !Array.isArray(payload.items)) {
          throw new Error('Missing required cart fields');
        }

        console.log('Updating cart:', {
          userId: payload.userId,
          itemCount: payload.items.length,
          items: JSON.stringify(payload.items)
        });

        // Use upsert operation
        const { error: updateError } = await supabase
          .from('shopping_cart')
          .upsert(
          {
            user_id: payload.userId,
            items: payload.items,
            updated_at: new Date().toISOString()
          },
          {
            onConflict: 'user_id',
            ignoreDuplicates: false
          });

        if (updateError) {
          console.error('Failed to update cart:', updateError);
          throw updateError;
        }

        console.log('Cart updated successfully');
        return { 
          statusCode: 200, 
          headers, 
          body: JSON.stringify({ success: true }) 
        };

      case 'getProductOptions':
        if (!payload.productId) {
          throw new Error('Missing product ID');
        }

        const { data: productOptions, error: productOptionsError } = await supabase
          .from('product_options')
          .select(`
            *,
            option:options (
              *,
              values:option_values (*)
            )
          `)
          .eq('product_id', payload.productId);

        if (productOptionsError) throw productOptionsError;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ data: productOptions })
        };

      case 'getCategoryOptions':
        if (!payload.categoryId) {
          throw new Error('Missing category ID');
        }

        const { data: categoryOptions, error: categoryOptionsError } = await supabase
          .from('options')
          .select(`
            *,
            values:option_values (*)
          `)
          .eq('category_id', payload.categoryId)
          .eq('is_global', true);

        if (categoryOptionsError) throw categoryOptionsError;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ data: categoryOptions })
        };

      case 'getOptionValues':
        if (!payload.optionId) {
          throw new Error('Missing option ID');
        }

        const { data: optionValues, error: optionValuesError } = await supabase
          .from('option_values')
          .select('*')
          .eq('option_id', payload.optionId)
          .order('sort_order');

        if (optionValuesError) throw optionValuesError;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ data: optionValues })
        };

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }
  } catch (error: any) {
    console.error('Error in Supabase client:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: { 
          message: error.message || 'Internal server error',
          details: error.details || error.message
        }
      })
    };
  }
};