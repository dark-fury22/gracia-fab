// Thin client for the Monnify collections API.
//
// Env:
//   MONNIFY_API_KEY        — from the Monnify dashboard (Developers section)
//   MONNIFY_SECRET_KEY     — ditto; also the key for webhook signatures
//   MONNIFY_CONTRACT_CODE  — ditto
//   MONNIFY_BASE_URL       — optional. Defaults to live (https://api.monnify.com)
//                            when NODE_ENV=production, sandbox otherwise.
import crypto from "crypto";
import fetch from "node-fetch";

const SANDBOX_URL = "https://sandbox.monnify.com";
const LIVE_URL = "https://api.monnify.com";

export function getMonnifyConfig() {
  const apiKey = process.env.MONNIFY_API_KEY;
  const secretKey = process.env.MONNIFY_SECRET_KEY;
  const contractCode = process.env.MONNIFY_CONTRACT_CODE;
  const baseUrl =
    process.env.MONNIFY_BASE_URL ||
    (process.env.NODE_ENV === "production" ? LIVE_URL : SANDBOX_URL);

  return {
    apiKey,
    secretKey,
    contractCode,
    baseUrl,
    // The web SDK only knows sandbox vs live; it's sandbox unless we're
    // explicitly pointed at the live API.
    isTestMode: baseUrl !== LIVE_URL,
    isConfigured: Boolean(apiKey && secretKey && contractCode),
  };
}

// Bearer tokens last ~1 hour; cache one per process and refresh a minute early.
let cachedToken = null;
let cachedTokenExpiresAt = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < cachedTokenExpiresAt) return cachedToken;

  const { apiKey, secretKey, baseUrl } = getMonnifyConfig();
  const basic = Buffer.from(`${apiKey}:${secretKey}`).toString("base64");

  const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}` },
  });
  const data = await res.json();

  if (!data?.requestSuccessful || !data?.responseBody?.accessToken) {
    throw new Error(
      `Monnify authentication failed: ${data?.responseMessage || res.status}`,
    );
  }

  cachedToken = data.responseBody.accessToken;
  const expiresInSec = Number(data.responseBody.expiresIn) || 3000;
  cachedTokenExpiresAt = Date.now() + (expiresInSec - 60) * 1000;
  return cachedToken;
}

// Look up a transaction by the paymentReference we generated for the order.
// Returns Monnify's responseBody (paymentStatus, amountPaid, customer, …).
export async function queryTransaction(paymentReference) {
  const { baseUrl } = getMonnifyConfig();
  const token = await getAccessToken();

  const url = `${baseUrl}/api/v2/merchant/transactions/query?paymentReference=${encodeURIComponent(paymentReference)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();

  if (!data?.requestSuccessful || !data?.responseBody) {
    throw new Error(
      `Monnify transaction lookup failed: ${data?.responseMessage || res.status}`,
    );
  }
  return data.responseBody;
}

// Monnify signs production webhooks with HMAC-SHA512 of the raw request body,
// keyed with the secret key, in the `monnify-signature` header. (Sandbox
// webhooks carry no signature — which is why the webhook handler never trusts
// the payload and always re-queries the transaction instead.)
export function isValidWebhookSignature(rawBody, signature) {
  const { secretKey } = getMonnifyConfig();
  if (!secretKey || !signature) return false;

  const expected = crypto
    .createHmac("sha512", secretKey)
    .update(rawBody)
    .digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Test hook: clear the cached token between tests.
export function _resetMonnifyTokenCache() {
  cachedToken = null;
  cachedTokenExpiresAt = 0;
}
