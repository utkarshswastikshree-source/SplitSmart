// PayPal Settlement Service Layer
// Future Integration Note:
// In production, connect this service to PayPal REST API v2:
// POST https://api-m.sandbox.paypal.com/v2/checkout/orders
// or use @paypal/react-paypal-js component integration.
// Backend proxy endpoint: /api/paypal/create-order and /api/paypal/capture-order

/**
 * Creates an order object for PayPal settlement
 * @param {Object} details - { amount, currency, recipientEmail, note, settlementId }
 * @returns {Promise<Object>} Order metadata & mock approval URL
 */
export async function createPayPalOrder({ amount, currency = 'INR', recipientEmail, note, settlementId }) {
  // Simulate network request to backend /api/paypal/create-order
  await new Promise((r) => setTimeout(r, 600));

  const mockOrderId = `PAYPAL-ORD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  return {
    orderId: mockOrderId,
    status: 'CREATED',
    amount: {
      currency_code: currency === 'INR' ? 'INR' : 'USD',
      value: amount.toFixed(2),
    },
    payee: {
      email_address: recipientEmail,
    },
    note,
    settlementId,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Captures an approved PayPal order and marks debt as settled
 * @param {string} orderId
 * @returns {Promise<Object>} Capture details with transaction ID
 */
export async function capturePayPalOrder(orderId) {
  // Simulate network request to backend /api/paypal/capture-order
  await new Promise((r) => setTimeout(r, 800));

  const mockTxnId = `PAYID-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  return {
    success: true,
    orderId,
    transactionId: mockTxnId,
    status: 'COMPLETED',
    capturedAt: new Date().toISOString(),
    fee: 0.00, // zero fees for friends & family peer settlement
  };
}

/**
 * Validates PayPal Sandbox credentials / readiness
 */
export function getPayPalConfig() {
  return {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || 'SANDBOX_CLIENT_ID_PLACEHOLDER',
    currency: 'INR',
    intent: 'capture',
    isSandbox: true,
  };
}

