import { NextResponse } from "next/server";
import { readJsonFile, writeJsonFile, readLocalJson, getDeletedBlogIdentifiers } from "@/lib/serverData";
import { BlogPostData } from "@/app/api/admin/blogs/route";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    let [blogs, deletedSet] = await Promise.all([
      readJsonFile<BlogPostData[]>("blog.json"),
      getDeletedBlogIdentifiers(),
    ]);

    const localBlogs = await readLocalJson<BlogPostData[]>("blog.json").catch(() => []);

    // Merge any new or missing local blogs that don't exist in MongoDB yet
    const existingIds = new Set((blogs || []).map((b) => b.id));
    const missingBlogs = (localBlogs || []).filter((b) => !existingIds.has(b.id));

    if (missingBlogs.length > 0 || !blogs || blogs.length === 0) {
      blogs = [...(missingBlogs || []), ...(blogs || [])];
      // Save merged array back to MongoDB Atlas
      writeJsonFile("blog.json", blogs).catch((err) =>
        console.warn("[Blogs] Auto-sync to DB error:", err)
      );
    }

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
