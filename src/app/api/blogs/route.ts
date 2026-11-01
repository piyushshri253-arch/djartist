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

    // Merge & sync latest article content from local blog.json into database
    const localMap = new Map((localBlogs || []).map((b) => [b.id, b]));
    let mergedBlogs = (blogs || []).map((b) => {
      if (b.id && b.id.startsWith("ARTICLE-") && localMap.has(b.id)) {
        return localMap.get(b.id)!;
      }
      return b;
    });

    const mergedIds = new Set(mergedBlogs.map((b) => b.id));
    const missing = (localBlogs || []).filter((b) => !mergedIds.has(b.id));
    if (missing.length > 0) {
      mergedBlogs = [...missing, ...mergedBlogs];
    }

    if (JSON.stringify(mergedBlogs) !== JSON.stringify(blogs)) {
      blogs = mergedBlogs;
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
