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
  Total?: string;
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
    let data: EPNResponse | null = null;
    const rawBody = event.body;

    try {
      console.log('Raw postback data:', {
        timestamp: new Date().toISOString(),
        body: rawBody
      });

      // Parse EPN's response format
      // Format is typically: Success=Y,RespText=Approved,XactID=12345,...
      const pairs = rawBody.split(',').map(pair => pair.trim());
      
      data = pairs.reduce((acc, pair) => {
        const [key, value] = pair.split('=').map(s => decodeURIComponent(s.trim()));
        return { ...acc, [key]: value };
      }, {} as EPNResponse);

      console.log('Parsed postback data:', {
        timestamp: new Date().toISOString(),
        data: JSON.stringify(data)
      });

      if (!data.Success || !data.RespText) {
        throw new Error('Invalid response format');
      }
    } catch (e) {
      console.error('Failed to parse postback data:', {
        timestamp: new Date().toISOString(),
        error: e instanceof Error ? e.message : 'Unknown error',
        rawBody
      });
      throw new Error('Invalid postback data format');
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
    const success = data.Success === 'Y';
    const respText = data.RespText || 'Unknown response';
    
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
                       data.Success === 'N' ? 'failed' : 'pending',
        payment_processor_id: transactionId,
        payment_processor_response: {
          success,
          respText,
          authCode,
          avsResp,
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