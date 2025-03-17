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
      // Parse the JSON response
      const parsedData = JSON.parse(event.body);
      
      // If FullResponse is a string containing JSON, parse it again
      if (typeof parsedData.FullResponse === 'string' && parsedData.FullResponse.startsWith('{')) {
        parsedData.FullResponse = JSON.parse(parsedData.FullResponse);
      }
      
      console.log('Parsed postback data:', {
        timestamp: new Date().toISOString(),
        parsedData: JSON.stringify(parsedData)
      });
      
      data = parsedData;
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

    // Parse the FullResponse field to extract success status and message
    let success = false;
    let respText = 'Unknown response';
    let fullResponseText = '';
    
    if (data.FullResponse) {
      // Handle both string and parsed JSON formats
      const fullResponseStr = typeof data.FullResponse === 'string' 
        ? data.FullResponse 
        : data.FullResponse.FullResponse || '';
        
      // Remove any surrounding quotes and get clean response
      fullResponseText = fullResponseStr.replace(/^"/, '').replace(/"$/, '').split(',')[0];
      
      // First character indicates success (Y/N/U)
      success = fullResponseText.charAt(0) === 'Y';
      
      // Rest of the text is the response message
      respText = fullResponseText.substring(1).trim();
      
      console.log('Parsed FullResponse:', {
        timestamp: new Date().toISOString(),
        fullResponseText,
        success,
        respText
      });
    }
    
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
                       fullResponseText.charAt(0) === 'N' ? 'failed' : 'pending',
        payment_processor_id: transactionId,
        payment_processor_response: {
          success,
          respText,
          fullResponseText,
          authCode,
          avsResponse: avsResp,
          cvv2Response: cvv2Resp,
          transactionId,
          rawResponse: data
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
                fullResponseText.charAt(0) === 'N' ? 'failed' : 'pending',
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