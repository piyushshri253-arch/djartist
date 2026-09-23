import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { readJsonFile, writeJsonFile } from "@/lib/serverData";

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

export async function DELETE(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing lead id" }, { status: 400 });
  }

  const leads = (await readJsonFile<any[]>("leads.json")) || [];
  const updated = leads.filter((item) => String(item.id) !== String(id));
  await writeJsonFile("leads.json", updated);

  return NextResponse.json({ success: true, count: updated.length });
}
