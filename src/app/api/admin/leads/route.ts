import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { readJsonFile } from "@/lib/serverData";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leads = await readJsonFile<any[]>("leads.json");
  return NextResponse.json(leads || [], {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
