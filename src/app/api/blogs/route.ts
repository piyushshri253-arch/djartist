import { NextResponse } from "next/server";
import { readJsonFile } from "@/lib/serverData";
import { BlogPostData } from "@/app/api/admin/blogs/route";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const blogs = await readJsonFile<BlogPostData[]>("blog.json");
    return NextResponse.json(blogs, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load blogs" }, { status: 500 });
  }
}
