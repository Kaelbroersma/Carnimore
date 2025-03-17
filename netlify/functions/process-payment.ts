import { Handler } from '@netlify/functions';
import https from 'node:https';
import tls from 'node:tls';
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
    const { 
      orderId, 
      cardNumber, 
      expiryMonth, 
      expiryYear, 
      cvv, 
      amount, 
      shippingAddress,
      billingAddress,
      items
    } = paymentData;

    // Get user ID from auth context if available
    const userId = event.headers.authorization?.split('Bearer ')[1] || null;

    // Format addresses for database
    const formattedShippingAddress = [
      shippingAddress.address,
      shippingAddress.city,
      shippingAddress.state,
      shippingAddress.zipCode
    ].filter(Boolean).join(', ');

    const formattedBillingAddress = billingAddress ? [
      billingAddress.address,
      billingAddress.city,
      billingAddress.state,
      billingAddress.zipCode
    ].filter(Boolean).join(', ') : formattedShippingAddress;

    // Validate environment variables
    if (!EPN_ACCOUNT || !EPN_RESTRICT_KEY) {
      throw new Error('Missing required environment variables');
    }

    // Validate required fields
    if (!cardNumber?.trim() || !expiryMonth?.trim() || !expiryYear?.trim() || 
        !cvv?.trim() || !amount || !orderId || 
        !shippingAddress?.address?.trim() || !shippingAddress?.zipCode?.trim()) {
      throw new Error('Missing required fields');
    }

    // Create initial order record in Supabase
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        user_id: userId, // Will be null for guest checkouts
        payment_status: 'pending',
        total_amount: amount,
        shipping_address: formattedShippingAddress,
        billing_address: formattedBillingAddress,
        order_date: new Date().toISOString(),
        payment_method: 'credit_card',
        shipping_method: 'standard',
        order_status: 'pending',
        created_at: new Date().toISOString()
      });

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    // Create order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(items.map(item => ({
        order_id: orderId,
        product_id: item.id,
        quantity: item.quantity,
        price_at_time_of_order: item.price,
        total_price: item.price * item.quantity,
        options: item.options
      })));

    if (itemsError) {
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }
    // Build payment processor request
    const params = new URLSearchParams({
      ePNAccount: EPN_ACCOUNT,
      RestrictKey: EPN_RESTRICT_KEY,
      RequestType: 'transaction',
      TranType: 'Sale',
      IndustryType: 'E',
      Total: amount,
      Address: billingAddress?.address || shippingAddress.address,
      Zip: billingAddress?.zipCode || shippingAddress.zipCode,
      CardNo: cardNumber,
      ExpMonth: expiryMonth,
      ExpYear: expiryYear,
      CVV2Type: '1',
      CVV2: cvv,
      'Postback.OrderID': orderId,
      'Postback.Description': `Order ${orderId}`,
      'Postback.Total': amount,
      'Postback.RestrictKey': EPN_RESTRICT_KEY,
      NOMAIL_CARDHOLDER: '1',
      NOMAIL_MERCHANT: '1'
    });

    // Send request to payment processor
    const request = https.request(EPN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': '*/*',
        'User-Agent': 'Carnimore/1.0',
        'X-EPN-Account': EPN_ACCOUNT
      },
      // Force TLS 1.2
      minVersion: tls.constants.TLSv1_2_VERSION,
      maxVersion: tls.constants.TLSv1_2_VERSION,
      // Secure cipher suites
      ciphers: [
        'ECDHE-RSA-AES256-GCM-SHA384',
        'ECDHE-RSA-AES128-GCM-SHA256'
      ].join(':'),
      // Additional security options
      secureOptions: {
        rejectUnauthorized: true,
        honorCipherOrder: true
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