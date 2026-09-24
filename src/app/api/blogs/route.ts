import { NextResponse } from "next/server";
import { readJsonFile, getDeletedBlogIdentifiers } from "@/lib/serverData";
import { BlogPostData } from "@/app/api/admin/blogs/route";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [blogs, deletedSet] = await Promise.all([
      readJsonFile<BlogPostData[]>("blog.json"),
      getDeletedBlogIdentifiers(),
    ]);

    const activeBlogs = (blogs || []).filter((b) => {
      if (b.id && deletedSet.has(b.id.toLowerCase().trim())) return false;
      if (b.slug && deletedSet.has(b.slug.toLowerCase().trim())) return false;
      if (b.title && deletedSet.has(b.title.toLowerCase().trim())) return false;
      return true;
    });

    return NextResponse.json(activeBlogs, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load blogs" }, { status: 500 });
  }
}
