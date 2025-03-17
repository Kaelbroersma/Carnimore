import { Handler } from '@netlify/functions';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  try {
    if (!event.body) {
      throw new Error('Missing request body');
    }

    const { orderId } = JSON.parse(event.body);

    if (!orderId) {
      throw new Error('Missing orderId');
    }
    
    // Get initial order status
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('payment_status')
      .eq('order_id', orderId)
      .single();
    
    if (orderError) {
      throw orderError;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        status: order?.payment_status || 'pending',
        orderId
      })
    };

  } catch (error: any) {
    console.error('Subscription error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: error.message || 'Failed to subscribe to order updates'
      })
    };
  }
};