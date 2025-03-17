export interface PaymentData {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    amount: number;
    address?: string;
    zip?: string;
    orderId: string; // Make orderId required
  }
  
  export interface PaymentResult {
    success: boolean;
    status: 'approved' | 'declined' | 'unprocessed';
    message: string;
    transactionId?: string;
    authCode?: string;
    orderId: string; // Add orderId to response
  }
  
  export interface EPNResponse {
    Success: 'Y' | 'N' | 'U'; // Y = Approved, N = Declined, U = Unable to process
    RespText: string;
    XactID?: string;
    AuthCode?: string;
    AVSResp?: string; // Address verification response
    CVV2Resp?: string; // CVV verification response
  }