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

    // Log incoming postback
    console.log('Payment postback received:', {
      timestamp: new Date().toISOString(),
      requestId: event.requestContext?.requestId,
      headers: event.headers,
      body: event.body
    });

    // Parse postback data
    let data: Record<string, string> = {};
    try {
      // Try both semicolon and comma separators
      const separator = event.body.includes(';') ? ';' : ',';
      data = Object.fromEntries(
        event.body.split(separator).map(pair => {
          const [key, value] = pair.split('=').map(s => decodeURIComponent(s.trim()));
          return [key, value];
        })
      );
    } catch (e) {
      console.error('Failed to parse postback data:', {
        timestamp: new Date().toISOString(),
        requestId: event.requestContext?.requestId,
        body: event.body,
        error: e instanceof Error ? e.message : 'Unknown error'
      });
      throw new Error('Invalid postback data format');
    }

    // Extract transaction details
    const transactionId = data.XactID;
    const orderId = data['Postback.OrderID'] || data.PostbackID || data.OrderID || data.orderId;
    const success = data.Success === 'Y' || data.Response?.startsWith('Y');
    const respText = data.RespText || data.Response;
    const authCode = data.AuthCode;
    const amount = data.Total || data['Postback.Total'];

    if (!transactionId || !orderId) {
      console.error('Missing required fields in postback:', {
        timestamp: new Date().toISOString(),
        requestId: event.requestContext?.requestId,
        receivedData: data
      });
      throw new Error('Missing required fields');
    }

    // Log extracted details
    console.log('Extracted postback details:', {
      timestamp: new Date().toISOString(),
      requestId: event.requestContext?.requestId,
      transactionId,
      orderId,
      success,
      respText,
      authCode
    });

    console.log('Processing payment postback:', {
      timestamp: new Date().toISOString(),
      requestId: event.requestContext?.requestId,
      transactionId,
      orderId,
      success,
      authCode
    });

    // Update payment_logs table
    const logResult = await supabase.from('payment_logs').upsert({
      transaction_id: transactionId,
      order_id: orderId,
      payment_status: success ? 'completed' : 
                     data.Success === 'N' ? 'failed' : 'pending',
      processor_response: data,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'transaction_id'
    });

    if (logResult.error) {
      console.error('Failed to update payment_logs:', {
        timestamp: new Date().toISOString(),
        requestId: event.requestContext?.requestId,
        error: logResult.error,
        transactionId,
        orderId
      });
    }

    // If payment was successful, update orders table
    if (success) {
      const orderResult = await supabase.from('orders').update({
        payment_status: 'paid'
      }).eq('order_id', orderId);

      if (orderResult.error) {
        console.error('Failed to update order:', {
          timestamp: new Date().toISOString(),
          requestId: event.requestContext?.requestId,
          error: orderResult.error,
          orderId
        });
      }

      // Create payment record
      const paymentResult = await supabase.from('payments').insert({
        order_id: orderId,
        payment_method: 'credit_card',
        payment_status: 'success',
        amount_paid: amount,
        transaction_id: transactionId
      });

      if (paymentResult.error) {
        console.error('Failed to create payment record:', {
          timestamp: new Date().toISOString(),
          requestId: event.requestContext?.requestId,
          error: paymentResult.error,
          transactionId,
          orderId
        });
      }
    }

    console.log('Payment postback processed successfully:', {
      timestamp: new Date().toISOString(),
      requestId: event.requestContext?.requestId,
      transactionId,
      orderId,
      success
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success,
        status: success ? 'approved' : 
                data.Success === 'N' ? 'declined' : 'pending',
        message: respText || (success ? 'Payment approved' : 'Payment declined'),
        transactionId,
        authCode,
        orderId
      })
    };
  } catch (error: any) {
    console.error('Payment postback error:', {
      timestamp: new Date().toISOString(),
      requestId: event.requestContext?.requestId,
      name: error.name,
      message: error.message
    });

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Failed to process postback'
      })
    };
  }
};