import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

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
    
    console.log('Order subscription request received:', {
      timestamp: new Date().toISOString(),
      requestId: event.requestContext?.requestId
    });

    const { orderId } = JSON.parse(event.body);

    if (!orderId) {
      console.error('Missing orderId in request:', {
        timestamp: new Date().toISOString(),
        requestId: event.requestContext?.requestId
      });
      throw new Error('Missing orderId');
    }

    console.log('Fetching order status:', {
      timestamp: new Date().toISOString(),
      requestId: event.requestContext?.requestId,
      orderId
    });

    // Get initial order status
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('payment_status, order_id, payment_processor_response')
      .eq('order_id', orderId)
      .single();
    
    if (orderError) {
      if (orderError.message.includes('No rows found')) {
        console.log('Order not found:', {
          timestamp: new Date().toISOString(),
          requestId: event.requestContext?.requestId,
          orderId
        });
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Order not found',
            orderId
          })
        };
      }
      console.error('Error fetching order:', {
        timestamp: new Date().toISOString(),
        requestId: event.requestContext?.requestId,
        error: orderError,
        orderId
      });
      throw orderError;
    }

    console.log('Order status retrieved:', {
      timestamp: new Date().toISOString(),
      requestId: event.requestContext?.requestId,
      orderId,
      status: order?.payment_status
    });

    // Return order status and any processor response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        status: order?.payment_status || 'pending',
        orderId,
        processorResponse: order?.payment_processor_response
      })
    };

  } catch (error: any) {
    console.error('Order subscription error:', {
      timestamp: new Date().toISOString(),
      requestId: event.requestContext?.requestId,
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        success: false,
        message: error.message || 'Failed to subscribe to order updates'
      })
    };
  }
};