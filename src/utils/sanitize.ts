/**
 * Utility functions for sanitizing sensitive data in logs
 */

// Mask all but last 4 digits
export const maskCardNumber = (cardNumber: string): string => {
    const cleaned = cardNumber.replace(/\s+/g, '');
    return cleaned.slice(-4).padStart(cleaned.length, '*');
  };
  
  // Mask CVV completely
  export const maskCVV = (cvv: string): string => {
    return '*'.repeat(cvv.length);
  };
  
  // Mask expiry date
  export const maskExpiry = (month: string, year: string): string => {
    return `**/${year.slice(-2)}`;
  };
  
  // Sanitize payment request data for logging
  export const sanitizePaymentData = (data: any): any => {
    const sanitized = { ...data };
    
    if (sanitized.cardNumber) {
      sanitized.cardNumber = maskCardNumber(sanitized.cardNumber);
    }
    if (sanitized.cvv) {
      sanitized.cvv = maskCVV(sanitized.cvv);
    }
    if (sanitized.CardNo) {
      sanitized.CardNo = maskCardNumber(sanitized.CardNo);
    }
    if (sanitized.CVV2) {
      sanitized.CVV2 = maskCVV(sanitized.CVV2);
    }
    
    // Remove any other sensitive fields
    delete sanitized.RestrictKey;
    delete sanitized['Postback.RestrictKey'];
    
    return sanitized;
  };