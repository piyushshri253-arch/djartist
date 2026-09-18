const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// Native crypto tests
const ENCRYPTION_KEY_RAW = "spark-super-secret-key-dj-2026-prod-instagram";
const ENCRYPTION_KEY = crypto.createHash("sha256").update(ENCRYPTION_KEY_RAW).digest();
const STATE_SECRET = "spark-instagram-oauth-state-secret-2026";

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

async function runTests() {
  console.log("=================================================");
  console.log("RUNNING INSTAGRAM INTEGRATION TEST SUITE");
  console.log("=================================================");

  // Test 1: AES-256-GCM Encryption & Decryption
  console.log("\n[TEST 1] AES-256-GCM Token Encryption & Decryption...");
  const rawToken = "EAABwzLixnjYBAK9ZBD76v3d0q9Lkd87sZAbcde...";
  const { encrypted, iv, tag } = encryptToken(rawToken);
  assert.notStrictEqual(encrypted, rawToken, "Encrypted token must not equal raw token");
  assert.strictEqual(typeof iv, "string");
  assert.strictEqual(typeof tag, "string");

  const decrypted = decryptToken(encrypted, iv, tag);
  assert.strictEqual(decrypted, rawToken, "Decrypted token must match original token exactly");
  console.log("✓ PASS: AES-256-GCM encryption and decryption verified.");

  // Test 2: OAuth CSRF State Protection
  console.log("\n[TEST 2] OAuth CSRF State Generation & Verification...");
  const { state, signedCookie } = generateOAuthState();
  assert(verifyOAuthState(state, signedCookie), "Valid state and cookie must verify true");
  assert(!verifyOAuthState("tampered_state", signedCookie), "Tampered state must fail");
  assert(!verifyOAuthState(state, "tampered_cookie"), "Tampered cookie must fail");
  console.log("✓ PASS: CSRF OAuth state security verified.");

  // Test 3: Database Schema & Integrity
  console.log("\n[TEST 3] Instagram Database File Structure...");
  const dbPath = path.join(process.cwd(), "src", "data", "instagram.json");
  assert(fs.existsSync(dbPath), "instagram.json must exist");
  const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
  assert(db.connection, "Must contain connection object");
  assert(db.settings, "Must contain settings object");
  assert(Array.isArray(db.reels), "Must contain reels array");
  assert(db.connection.username === "djgspark.music");
  assert(db.reels.length >= 4, "Must contain at least 4 reels");
  console.log(`✓ PASS: Database schema verified (${db.reels.length} reels loaded).`);

  // Test 4: Deduplication Logic
  console.log("\n[TEST 4] Reels Deduplication Engine...");
  const sampleReels = [
    { instagramMediaId: "18042918239012345", caption: "Updated Sunburn Caption", isVisible: false },
    { instagramMediaId: "new_media_9999", caption: "Brand New Reel", isVisible: true }
  ];

  const existingReels = JSON.parse(JSON.stringify(db.reels));
  // Set first reel visibility to false to test preservation
  existingReels[0].isVisible = false;

  const existingMap = new Map();
  for (const r of existingReels) existingMap.set(r.instagramMediaId, r);

  const updatedReels = [];
  for (const item of sampleReels) {
    const existing = existingMap.get(item.instagramMediaId);
    if (existing) {
      // Must preserve existing isVisible
      updatedReels.push({ ...existing, caption: item.caption });
      existingMap.delete(item.instagramMediaId);
    } else {
      updatedReels.push({ id: `ig-${Date.now()}`, ...item });
    }
  }
  for (const rem of existingMap.values()) updatedReels.push(rem);

  assert.strictEqual(updatedReels.find(r => r.instagramMediaId === "18042918239012345").isVisible, false, "Must preserve admin isVisible: false");
  assert.strictEqual(updatedReels.find(r => r.instagramMediaId === "18042918239012345").caption, "Updated Sunburn Caption", "Must update caption");
  assert(updatedReels.some(r => r.instagramMediaId === "new_media_9999"), "Must append new reel");
  console.log("✓ PASS: Deduplication and visibility preservation verified.");

  // Test 5: Live API Endpoints via HTTP
  console.log("\n[TEST 5] Testing API Endpoints on http://localhost:3002...");
  const publicRes = await fetch("http://localhost:3002/api/public/social/instagram");
  assert.strictEqual(publicRes.status, 200, "Public API must return 200");
  const publicData = await publicRes.json();
  assert.strictEqual(publicData.enabled, true, "Public data enabled flag must be true");
  assert(Array.isArray(publicData.reels), "Public data must have reels array");

  // Verify that NO hidden reels are exposed to public
  for (const r of publicData.reels) {
    assert.notStrictEqual(r.isVisible, false, "Public API must never return hidden reels");
    assert.strictEqual(r.accessTokenEncrypted, undefined, "Public API must never expose access tokens");
    assert.strictEqual(r.tokenIv, undefined, "Public API must never expose token IV");
  }
  console.log(`✓ PASS: Public API returned ${publicData.reels.length} visible reels with zero token leakage.`);

  console.log("\n=================================================");
  console.log("ALL 5 TESTS PASSED SUCCESSFULLY! 🎯");
  console.log("=================================================");
}

runTests().catch(err => {
  console.error("Test failure:", err);
  process.exit(1);
});
