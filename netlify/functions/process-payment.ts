import { Handler } from '@netlify/functions';
import fetch from 'node-fetch';
import https from 'node:https';
import { createClient } from '@supabase/supabase-js';
import type { PaymentData } from '../../src/types/payment';

// Environment variables
const EPN_ACCOUNT = process.env.EPN_ACCOUNT_NUMBER;
const EPN_RESTRICT_KEY = process.env.EPN_X_TRAN;
const EPN_API_URL = 'https://www.eprocessingnetwork.com/cgi-bin/epn/secure/tdbe/transact.pl';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

// Function to safely log payment data without sensitive info
const sanitizePaymentData = (data: PaymentData) => {
  const { cardNumber, cvv, ...safeData } = data;
  return {
    ...safeData,
    cardNumber: cardNumber ? `****${cardNumber.slice(-4)}` : undefined,
    cvv: '***'
  };
};

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

    // Log incoming request (excluding sensitive data)
    const paymentData: PaymentData = JSON.parse(event.body);
    console.log('Payment request received:', {
      timestamp: new Date().toISOString(),
      requestId: event.requestContext?.requestId,
      data: sanitizePaymentData(paymentData),
      headers: event.headers
    });

    // Validate environment variables
    if (!EPN_ACCOUNT || !EPN_RESTRICT_KEY) {
      throw new Error('Missing required environment variables');
    }

    // Build request body for EPN
    const params = new URLSearchParams({
      ePNAccount: EPN_ACCOUNT,
      RestrictKey: EPN_RESTRICT_KEY,
      RequestType: 'transaction',
      TranType: 'Sale',
      IndustryType: 'E',
      Total: paymentData.amount.toString(),
      Address: paymentData.address || '',
      Zip: paymentData.zip || '',
      CardNo: paymentData.cardNumber,
      ExpMonth: paymentData.expiryMonth.padStart(2, '0'),
      ExpYear: paymentData.expiryYear.slice(-2),
      CVV2Type: '1',
      CVV2: paymentData.cvv,
      OrderID: paymentData.orderId,
      Description: `Order ${paymentData.orderId}`,
      PostbackID: paymentData.orderId,
      'Postback.OrderID': paymentData.orderId,
      'Postback.Description': `Order ${paymentData.orderId}`,
      'Postback.Total': paymentData.amount.toString(),
      NOMAIL_CARDHOLDER: '1',
      NOMAIL_MERCHANT: '1'
    });

    // Log full request details (excluding sensitive data)
    console.log('Sending request to EPN:', {
      timestamp: new Date().toISOString(),
      requestId: event.requestContext?.requestId,
      orderId: paymentData.orderId,
      endpoint: EPN_API_URL,
      params: Object.fromEntries(
        Array.from(params.entries())
          .filter(([key]) => !['CardNo', 'CVV2'].includes(key))
          .map(([key, value]) => [key, key === 'ExpMonth' || key === 'ExpYear' ? '**' : value])
      )
    });

    // Make request to eProcessingNetwork
    const response = await fetch(EPN_API_URL, {
      method: 'POST',
      agent: new https.Agent({
        minVersion: 'TLSv1.2'
      }),
      body: params.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': '*/*'
      },
      timeout: 30000 // 30 second timeout for initial response
    });

    // Log raw response details immediately
    console.log('Raw EPN response:', {
      timestamp: new Date().toISOString(),
      requestId: event.requestContext?.requestId,
      orderId: paymentData.orderId,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    // Check if response is not OK
    if (!response.ok) {
      console.error('EPN request failed:', {
        timestamp: new Date().toISOString(),
        requestId: event.requestContext?.requestId,
        orderId: paymentData.orderId,
        status: response.status,
        statusText: response.statusText
      });
      throw new Error('Payment processor error');
    }

    const responseText = await response.text();
    
    // Log the complete raw response text
    console.log('EPN response text:', {
      timestamp: new Date().toISOString(),
      requestId: event.requestContext?.requestId,
      orderId: paymentData.orderId,
      responseText
    });
    console.log('EPN response received:', {
      timestamp: new Date().toISOString(),
      requestId: event.requestContext?.requestId,
      orderId: paymentData.orderId,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText
    });

    // Parse response
    let result;
    try {
      // Parse response and normalize field names
      const pairs = responseText.split(',').reduce((acc, pair) => {
        const [key, value] = pair.split('=').map(s => s.trim());
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      
      // Log raw response pairs for debugging
      console.log('Raw response pairs:', {
        timestamp: new Date().toISOString(),
        requestId: event.requestContext?.requestId,
        orderId: paymentData.orderId,
        pairs
      });
      
      result = {
        Success: pairs.Success,
        RespText: pairs.RespText,
        XactID: pairs.XactID,
        AuthCode: pairs.AuthCode,
        AVSResp: pairs.AVSResp,
        CVV2Resp: pairs.CVV2Resp,
        OrderID: pairs.OrderID || paymentData.orderId
      };
      
      console.log('Parsed JSON response:', {
        timestamp: new Date().toISOString(),
        requestId: event.requestContext?.requestId,
        orderId: paymentData.orderId,
        result
      });
    } catch (e) {
      console.error('Failed to parse response:', {
        timestamp: new Date().toISOString(),
        requestId: event.requestContext?.requestId,
        error: e instanceof Error ? e.message : 'Unknown error',
        responseText
      });
      throw new Error('Failed to parse payment response');
    }

    // Log parsed result
    console.log('Payment processing result:', {
      timestamp: new Date().toISOString(),
      requestId: event.requestContext?.requestId,
      orderId: paymentData.orderId,
      transactionId: result.XactID,
      success: result.Success === 'Y',
      status: result.Success === 'Y' ? 'approved' : 
              result.Success === 'N' ? 'declined' : 'unprocessed',
      message: result.RespText
    });

    // Return response with transaction details
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: result.Success === 'Y',
        status: result.Success === 'Y' ? 'approved' : 
                result.Success === 'N' ? 'declined' : 'unprocessed',
        message: result.RespText || {
          Y: 'Payment approved',
          N: 'Payment declined - please check your card details',
          U: 'Unable to process payment - please try again'
        }[result.Success],
        transactionId: result.XactID,
        authCode: result.AuthCode,
        orderId: paymentData.orderId
      })
    };

  } catch (error: any) {
    // Log error but don't expose internal details to client
    console.error('Payment processing error:', {
      timestamp: new Date().toISOString(),
      requestId: event.requestContext?.requestId,
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    // Handle timeout errors specifically
    if (error.type === 'request-timeout' || error.name === 'AbortError' || error.message.includes('timeout')) {
      return {
        statusCode: 504,
        headers,
        body: JSON.stringify({
          success: false,
          status: 'timeout',
          message: 'The payment is still processing. Please check your email for confirmation or contact support if the charge appears on your card.'
        })
      };
    }
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        status: 'unprocessed',
        message: 'Payment service is temporarily unavailable. Please try again in a few moments.'
      })
    };
  }
};