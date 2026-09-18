import { NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/serverData";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { AdminUserData } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await readJsonFile<AdminUserData[]>("admin_users.json");
    return NextResponse.json(users || [], {
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load admin users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin || admin.role !== "Super Admin") {
      return NextResponse.json({ error: "Forbidden: Super Admin only" }, { status: 403 });
    }

    const body = await req.json();
    const users = (await readJsonFile<AdminUserData[]>("admin_users.json")) || [];

    const newUser: AdminUserData = {
      id: `USR-${Date.now()}`,
      name: body.name || "New Admin",
      email: body.email || "",
      role: body.role || "Event Admin",
      permissions: body.permissions || ["events.manage"],
      status: "active",
      avatar: body.avatar || "",
      createdAt: new Date().toISOString(),
      lastLogin: null,
    };

    users.push(newUser);
    await writeJsonFile("admin_users.json", users);

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create admin user" }, { status: 500 });
  }
}
