import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EPN_RESTRICT_KEY = process.env.EPN_X_TRAN;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

interface EPNResponse {
  Success: 'Y' | 'N' | 'U';
  RespText: string;
  XactID?: string;
  AuthCode?: string;
  AVSResp?: string;
  CVV2Resp?: string;
  OrderID?: string;
  'Postback.OrderID'?: string;
  'Postback.RestrictKey'?: string;
}

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  try {
    if (!event.body) {
      throw new Error('Missing postback data');
    }

    // Log incoming postback
    console.log('Payment postback received:', {
      timestamp: new Date().toISOString(),
      requestId: event.requestContext?.requestId,
      headers: event.headers,
      body: event.body
    });

    // Parse postback data
    let data: EPNResponse;
    try {
      // First try to parse as JSON
      data = JSON.parse(event.body);
    } catch (e) {
      // If JSON parse fails, try parsing as extended postback format
      try {
        // Try both semicolon and comma separators
        const separator = event.body.includes(';') ? ';' : ',';
        console.log('Parsing extended postback format:', {
          timestamp: new Date().toISOString(),
          requestId: event.requestContext?.requestId,
          separator
        });
        data = Object.fromEntries(
          event.body.split(separator).map(pair => {
            const [key, value] = pair.split('=').map(s => decodeURIComponent(s.trim()));
            return [key, value];
          })
        ) as EPNResponse;
      } catch (e) {
        console.error('Failed to parse postback data:', {
          timestamp: new Date().toISOString(),
          requestId: event.requestContext?.requestId,
          body: event.body,
          error: e instanceof Error ? e.message : 'Unknown error'
        });
        throw new Error('Invalid postback data format');
      }
    }

    // Validate RestrictKey if provided
    if (data['Postback.RestrictKey'] && data['Postback.RestrictKey'] !== EPN_RESTRICT_KEY) {
      throw new Error('Invalid RestrictKey');
    }

    // Extract transaction details
    const transactionId = data.XactID;
    const orderId = data['Postback.OrderID'] || data.OrderID;
    const success = data.Success === 'Y';
    const respText = data.RespText;
    const authCode = data.AuthCode;

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

    // Update order status in Supabase
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: success ? 'paid' : 
                       data.Success === 'N' ? 'failed' : 'pending',
        payment_processor_id: transactionId,
        payment_processor_response: data
      })
      .eq('order_id', orderId);

    if (updateError) {
      console.error('Failed to update order:', {
        timestamp: new Date().toISOString(),
        requestId: event.requestContext?.requestId,
        error: updateError,
        orderId
      });
      throw new Error('Failed to update order status');
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
        success: true,
        status: success ? 'paid' : 
                data.Success === 'N' ? 'failed' : 'pending',
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
      message: error.message,
      stack: error.stack
    });

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Failed to process postback',
        error: error.message
      })
    };
  }
};