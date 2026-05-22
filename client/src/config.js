const config = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  PAYSTACK_KEY: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
}

export default config