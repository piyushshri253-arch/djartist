import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { saveUploadedMedia } from "@/lib/mediaStorage";
import path from "path";

export const dynamic = "force-dynamic";

// Whitelist safe raster formats. Strictly block executable/script formats
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/jfif",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".jfif",
  ".pjpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB maximum limit (matches UI)

// Upload rate limiter: max 100 uploads per 10 minutes per IP for authenticated admin
const uploadAttempts = new Map<string, { count: number; resetAt: number }>();

function checkUploadRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = uploadAttempts.get(ip);
  if (!record || record.resetAt < now) {
    uploadAttempts.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return true;
  }
  if (record.count >= 100) {
    return false;
  }
  record.count += 1;
  return true;
}

/**
 * Validates actual file signature (magic bytes) from raw buffer.
 * Defends against disguised executable/HTML/SVG files.
 */
function validateImageMagicBytes(buffer: Buffer): { valid: boolean; detectedFormat?: string } {
  if (!buffer || buffer.length < 12) {
    return { valid: false };
  }

  // JPEG / JPG / JFIF: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, detectedFormat: "jpeg" };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, detectedFormat: "png" };
  }

  // WEBP: RIFF....WEBP (bytes 0-3: 'RIFF', bytes 8-11: 'WEBP')
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { valid: true, detectedFormat: "webp" };
  }

  // GIF: GIF87a or GIF89a
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return { valid: true, detectedFormat: "gif" };
  }

  // AVIF: ....ftypavif or ....ftypavis
  if (buffer.length >= 16) {
    const ftyp = buffer.toString("ascii", 4, 8);
    const brand = buffer.toString("ascii", 8, 12);
    if (ftyp === "ftyp" && (brand === "avif" || brand === "avis" || brand === "mif1")) {
      return { valid: true, detectedFormat: "avif" };
    }
  }

  return { valid: false };
}

export async function POST(request: Request) {
  // 1. Strict Server-Side Admin Authentication Check
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  // 2. IP Rate Limiting for Uploads
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  if (!checkUploadRateLimit(ip)) {
    return NextResponse.json(
      { error: "Upload rate limit exceeded. Please wait a few minutes before trying again." },
      { status: 429 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    // 3. File Size Validation
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds maximum allowed limit of 10MB." },
        { status: 400 }
      );
    }

    if (file.size < 12) {
      return NextResponse.json({ error: "Invalid image file (empty or corrupt)." }, { status: 400 });
    }

    // 4. Declared MIME Type Validation
    if (file.type && !ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
      return NextResponse.json(
        {
          error: "Invalid file format. Only JPG, PNG, WebP, GIF, and AVIF images are allowed.",
        },
        { status: 400 }
      );
    }

    // 5. File Extension Validation
    const rawExtension = path.extname(file.name || "").toLowerCase();
    if (rawExtension && !ALLOWED_EXTENSIONS.has(rawExtension)) {
      return NextResponse.json(
        { error: "Invalid file extension. Only .jpg, .jpeg, .png, .webp, .gif, and .avif are accepted." },
        { status: 400 }
      );
    }

    // Convert to Buffer for inspection
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 6. Magic Bytes / File Signature Deep Inspection
    const signatureCheck = validateImageMagicBytes(buffer);
    if (!signatureCheck.valid || !signatureCheck.detectedFormat) {
      return NextResponse.json(
        {
          error: "Security verification failed: File content does not match legitimate image headers.",
        },
        { status: 400 }
      );
    }

    // 7. Controlled & Persistent Storage (MongoDB Atlas + optional disk)
    const storageResult = await saveUploadedMedia(
      buffer,
      signatureCheck.detectedFormat,
      "spark_upload"
    );

    return NextResponse.json(
      {
        success: true,
        url: storageResult.url,
        fileName: storageResult.filename,
        size: file.size,
        type: `image/${signatureCheck.detectedFormat}`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Upload Security] Error processing upload:", error);
    return NextResponse.json(
      { error: "Failed to process image upload safely." },
      { status: 500 }
    );
  }
}
