import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EPN_RESTRICT_KEY = process.env.EPN_X_TRAN;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

interface EPNResponse {
  FullResponse: string;
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
      requestId: event.requestContext?.requestId || 'no-request-id',
      method: event.httpMethod,
      headers: JSON.stringify(event.headers),
      rawBody: event.body,
      isBase64Encoded: event.isBase64Encoded || false,
      contentType: event.headers['content-type'] || event.headers['Content-Type']
    });

    // Parse postback data
    let data: EPNResponse;
    try {
      // First try to parse as JSON
      console.log('Attempting JSON parse:', {
        timestamp: new Date().toISOString(),
        body: event.body
      });
      data = JSON.parse(event.body);
      console.log('Successfully parsed JSON response:', {
        timestamp: new Date().toISOString(),
        parsedData: JSON.stringify(data)
      });
    } catch (e) {
      // If JSON parse fails, try parsing as extended postback format
      try {
        // Try both semicolon and comma separators
        const separator = event.body.includes(';') ? ';' : ',';
        console.log('Parsing extended postback format:', {
          timestamp: new Date().toISOString(),
          requestId: event.requestContext?.requestId || 'no-request-id',
          separator,
          pairs: event.body.split(separator).map(pair => pair.trim())
        });
        data = Object.fromEntries(
          event.body.split(separator).map(pair => {
            const [key, value] = pair.split('=').map(s => decodeURIComponent(s.trim()));
            console.log('Parsed key-value pair:', {
              timestamp: new Date().toISOString(),
              key,
              value
            });
            return [key, value];
          })
        ) as EPNResponse;
        console.log('Successfully parsed extended format:', {
          timestamp: new Date().toISOString(),
          parsedData: JSON.stringify(data)
        });
      } catch (e) {
        console.error('Failed to parse postback data:', {
          timestamp: new Date().toISOString(),
          requestId: event.requestContext?.requestId || 'no-request-id',
          rawBody: event.body,
          error: e instanceof Error ? e.message : 'Unknown error',
          errorStack: e instanceof Error ? e.stack : undefined
        });
        throw new Error('Invalid postback data format');
      }
    }

    // Validate RestrictKey if provided
    console.log('Validating RestrictKey:', {
      timestamp: new Date().toISOString(),
      hasRestrictKey: !!data['Postback.RestrictKey'],
      restrictKeyMatch: data['Postback.RestrictKey'] === EPN_RESTRICT_KEY
    });
    
    if (data['Postback.RestrictKey'] && data['Postback.RestrictKey'] !== EPN_RESTRICT_KEY) {
      console.error('RestrictKey validation failed:', {
        timestamp: new Date().toISOString(),
        receivedKey: data['Postback.RestrictKey']
      });
      throw new Error('Invalid RestrictKey');
    }

    // Extract transaction details
    const fullResponse = data.FullResponse?.replace(/^"/, '').replace(/"$/, '') || '';
    // Extract success status from first character of FullResponse
    const success = fullResponse.charAt(0) === 'Y';
    // Extract response message from remaining text
    const respText = fullResponse.substring(1) || 'Unknown response';
    
    const transactionId = data.XactID;
    const orderId = data['Postback.OrderID'] || data.OrderID;
    const authCode = data.AuthCode;
    const avsResp = data.AVSResp;
    const cvv2Resp = data.CVV2Resp;

    if (!transactionId || !orderId) {
      console.error('Missing required fields in postback:', {
        timestamp: new Date().toISOString(),
        requestId: event.requestContext?.requestId || 'no-request-id',
        receivedData: JSON.stringify(data),
        hasTransactionId: !!transactionId,
        hasOrderId: !!orderId
      });
      throw new Error('Missing required fields');
    }

    // Log extracted details
    console.log('Extracted postback details:', {
      timestamp: new Date().toISOString(),
      requestId: event.requestContext?.requestId || 'no-request-id',
      transactionId,
      orderId,
      success,
      respText,
      authCode,
      avsResponse: avsResp,
      cvv2Response: cvv2Resp,
      fullResponse: JSON.stringify(data)
    });

    // Update order status in Supabase
    console.log('Updating order status:', {
      timestamp: new Date().toISOString(),
      orderId,
      newStatus: success ? 'paid' : data.Success === 'N' ? 'failed' : 'pending',
      transactionId
    });

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: success ? 'paid' : 
                       fullResponse.charAt(0) === 'N' ? 'failed' : 'pending',
        payment_processor_id: transactionId,
        payment_processor_response: {
          success,
          respText,
          fullResponse,
          authCode,
          avsResponse: avsResp,
          cvv2Response: cvv2Resp,
          transactionId,
          fullResponse: data
        }
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
                fullResponse.charAt(0) === 'N' ? 'failed' : 'pending',
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