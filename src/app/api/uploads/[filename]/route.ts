import { NextResponse } from "next/server";
import { getMediaFromStorage } from "@/lib/mediaStorage";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  if (!filename) {
    return new NextResponse("Filename is required", { status: 400 });
  }

  const media = await getMediaFromStorage(filename);
  if (!media) {
    return new NextResponse("Image not found", { status: 404 });
  }

  return new NextResponse(media.buffer, {
    headers: {
      "Content-Type": media.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
