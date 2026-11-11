// Flat delivery fee in NGN, charged on every order.
//
// The server is the only source of truth for this: createOrder ignores any
// deliveryPrice the client sends, and the checkout page charges Paystack the
// totalPrice the server returns. Checkout.jsx also displays this value before
// the order exists, so update DELIVERY_FEE there if you change it here.
export const DELIVERY_FEE = 2500;
