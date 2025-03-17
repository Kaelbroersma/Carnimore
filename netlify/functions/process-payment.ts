import { Handler } from '@netlify/functions';
import https from 'https';
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
    
    console.log('Payment processing started:', {
      timestamp: new Date().toISOString()
    });

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

    console.log('Payment data received:', {
      timestamp: new Date().toISOString(),
      orderId,
      amount,
      itemCount: items?.length
    });

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
    console.log('Creating order record:', { timestamp: new Date().toISOString(), orderId });

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
      })
      .select()
      .single();

    if (orderError) {
      console.error('Failed to create order:', {
        timestamp: new Date().toISOString(),
        error: orderError,
        orderId
      });
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    console.log('Order created successfully:', { timestamp: new Date().toISOString(), orderId });

    // Create order items
    console.log('Creating order items:', {
      timestamp: new Date().toISOString(),
      orderId,
      itemCount: items.length
    });

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(items.map(item => ({
        order_id: orderId,
        product_id: item.id,
        quantity: item.quantity,
        price_at_time_of_order: item.price,
        total_price: item.price * item.quantity,
        options: item.options
      })))
      .select();

    if (itemsError) {
      console.error('Failed to create order items:', {
        timestamp: new Date().toISOString(),
        error: itemsError,
        orderId
      });
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    console.log('Order items created successfully:', { timestamp: new Date().toISOString(), orderId });

    // Build payment processor request payload
    const params = new URLSearchParams({
      ePNAccount: EPN_ACCOUNT,
      RestrictKey: EPN_RESTRICT_KEY,
      RequestType: 'transaction',
      TranType: 'Sale',
      IndustryType: 'E',
      Total: amount,
      Address: billingAddress?.address || shippingAddress.address || '',
      Zip: billingAddress?.zipCode || shippingAddress.zipCode || '',
      CardNo: cardNumber.replace(/\s+/g, ''),
      ExpMonth: expiryMonth.padStart(2, '0'),
      ExpYear: expiryYear.slice(-2),
      CVV2Type: '1',
      CVV2: cvv,
      'Postback.OrderID': orderId,
      'Postback.Description': `Order ${orderId}`,
      'Postback.Total': amount,
      'Postback.RestrictKey': EPN_RESTRICT_KEY,
      PostbackID: orderId,
      COMBINE_PB_RESPONSE: '1',
      NOMAIL_CARDHOLDER: '1',
      NOMAIL_MERCHANT: '1'
    });

    console.log('Sending payment request to processor:', {
      timestamp: new Date().toISOString(),
      orderId,
      amount
    });

    // Create HTTPS request with proper TLS settings
    const makeRequest = async () => {
      const response = await fetch(EPN_API_URL, {
        method: 'POST',
        agent: new https.Agent({
          minVersion: 'TLSv1.2'
        }),
        body: params.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': '*/*', 
        }
      });

      console.log('Payment request sent to processor:', { 
        timestamp: new Date().toISOString(),
        orderId 
      });

      return response;
    };

    // Send the request
    await makeRequest();

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
    console.error('Payment processing error:', {
      timestamp: new Date().toISOString(),
      name: error.name,
      message: error.message,
      stack: error.stack
    });

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