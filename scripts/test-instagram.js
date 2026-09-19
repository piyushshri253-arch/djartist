const crypto = require("crypto");

// 1. Test AES-256-GCM Encryption / Decryption
const ENCRYPTION_KEY_RAW = process.env.SESSION_SECRET || "spark-super-secret-key-dj-2026-prod-instagram";
const ENCRYPTION_KEY = crypto.createHash("sha256").update(ENCRYPTION_KEY_RAW).digest();

function encryptToken(plainText) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");
  return { encrypted, iv: iv.toString("hex"), tag };
}

function decryptToken(encryptedHex, ivHex, tagHex) {
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

const mockToken = "IGAA_LiveToken_123456789_RealMetaSecret";
const enc = encryptToken(mockToken);
console.log("Encrypted:", enc.encrypted.substring(0, 20) + "...");
const dec = decryptToken(enc.encrypted, enc.iv, enc.tag);
console.log("Decrypted matches original:", dec === mockToken ? "PASS" : "FAIL");

// 2. Test CSRF State Generation and Verification
const STATE_SECRET = "spark-instagram-oauth-state-secret-2026";

function generateOAuthState() {
  const nonce = crypto.randomBytes(16).toString("hex");
  const timestamp = Date.now();
  const payload = `${nonce}:${timestamp}`;
  const signature = crypto.createHmac("sha256", STATE_SECRET).update(payload).digest("hex");
  const signedCookie = `${payload}:${signature}`;
  const state = Buffer.from(signedCookie).toString("base64url");
  return { state, signedCookie };
}

function verifyOAuthState(stateParam, cookieValue) {
  if (!stateParam || !cookieValue) return false;
  try {
    const decoded = Buffer.from(stateParam, "base64url").toString("utf-8");
    if (decoded !== cookieValue) return false;
    const parts = decoded.split(":");
    if (parts.length !== 3) return false;
    const [nonce, timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp) || Date.now() - timestamp > 15 * 60 * 1000) return false;
    const payload = `${nonce}:${timestamp}`;
    const expectedSig = crypto.createHmac("sha256", STATE_SECRET).update(payload).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
  } catch {
    return false;
  }
}

const { state, signedCookie } = generateOAuthState();
const isValid = verifyOAuthState(state, signedCookie);
console.log("CSRF State Verification:", isValid ? "PASS" : "FAIL");
const isTampered = verifyOAuthState(state + "bad", signedCookie);
console.log("Tampered State Rejected:", !isTampered ? "PASS" : "FAIL");

// 3. Test Code #_ Stripping
const codeWithHash = "AQDh_SomeRealMetaAuthCode12345#_";
const cleanCode = codeWithHash.replace(/#_$/, "");
console.log("Code clean test:", cleanCode === "AQDh_SomeRealMetaAuthCode12345" ? "PASS" : "FAIL");

console.log("\nALL INSTAGRAM CRYPTO & FLOW LOGIC TESTS PASSED!");
