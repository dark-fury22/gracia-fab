import crypto from "crypto";

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;

export const OTP_MAX_ATTEMPTS = 5;

// Cryptographically random 6-digit numeric code (zero-padded, so "042819"
// is valid — never treat this as a number).
export function generateOtpCode() {
  return crypto.randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, "0");
}

// Store only a hash of the code, never the code itself — same principle as
// password storage, just with a fast hash since it's short-lived and
// already rate-limited/attempt-capped rather than needing bcrypt's cost.
export function hashOtpCode(code) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export function otpExpiryDate() {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
}
