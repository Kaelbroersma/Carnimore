import { Handler } from '@netlify/functions';
import https from 'node:https';
import { createClient } from '@supabase/supabase-js';

// Environment variables
const EPN_ACCOUNT = process.env.EPN_ACCOUNT_NUMBER;
const EPN_RESTRICT_KEY = process.env.EPN_X_TRAN;
const EPN_API_URL = 'https://www.eprocessingnetwork.com/cgi-bin/epn/secure/tdbe/transact.pl';
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

    const paymentData = JSON.parse(event.body);
    const { orderId, cardNumber, expiryMonth, expiryYear, cvv, amount, address, zip } = paymentData;

    // Validate environment variables
    if (!EPN_ACCOUNT || !EPN_RESTRICT_KEY) {
      throw new Error('Missing required environment variables');
    }

    // Create order in Supabase
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        payment_status: 'pending',
        total_amount: amount,
        shipping_address: address || '',
        order_date: new Date().toISOString()
      });

    if (orderError) {
      throw new Error('Failed to create order');
    }

    // Build payment processor request
    const params = new URLSearchParams({
      ePNAccount: EPN_ACCOUNT,
      RestrictKey: EPN_RESTRICT_KEY,
      RequestType: 'transaction',
      TranType: 'Sale',
      IndustryType: 'E',
      Total: amount,
      Address: address || '',
      Zip: zip || '',
      CardNo: cardNumber,
      ExpMonth: expiryMonth,
      ExpYear: expiryYear,
      CVV2Type: '1',
      CVV2: cvv,
      OrderID: orderId,
      Description: `Order ${orderId}`,
      PostbackID: orderId,
      'Postback.OrderID': orderId,
      'Postback.Description': `Order ${orderId}`,
      'Postback.Total': amount,
      'Postback.RestrictKey': EPN_RESTRICT_KEY,      NOMAIL_CARDHOLDER: '1',
      NOMAIL_MERCHANT: '1'
    });

    // Send request to payment processor
    const request = https.request(EPN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': '*/*'
      }
    });

    request.write(params.toString());
    request.end();

    // Return success response immediately
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        orderId,
        message: 'Payment processing initiated'
      })
    };

  } catch (error: any) {
    console.error('Payment processing error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: error.message || 'Failed to process payment'
      })
    };
  }
};