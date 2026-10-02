import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import {
  readJsonFile,
  writeJsonFile,
  getDeletedBlogIdentifiers,
  purgeBlogEverywhere,
  unmarkDeletedBlog,
} from "@/lib/serverData";
import { sanitizeString, isSafeUrl, validateOrigin, unauthorizedResponse } from "@/lib/security";
import { logAdminAction } from "@/lib/audit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PROHIBITED_PATTERN = /\b(porn|sex|pussy|boobs|fuck|fucking|bitch|dick|cock|nude|naked|xxx|casino|viagra|cialis)\b/i;

function hasProhibitedContent(obj: any): boolean {
  if (!obj) return false;
  const str = typeof obj === "string" ? obj : JSON.stringify(obj);
  return PROHIBITED_PATTERN.test(str);
}

export interface BlogPostData {
  id: string;
  slug: string;
  title: string;
  category: string;
  categorySlug?: string;
  date: string;
  dateDisplay: string;
  readTime: string;
  author: string;
  authorRole?: string;
  image: string;
  excerpt: string;
  content: string;
}

// GET all blogs
export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return unauthorizedResponse();
  }

  const [blogs, deletedSet] = await Promise.all([
    readJsonFile<BlogPostData[]>("blog.json"),
    getDeletedBlogIdentifiers(),
  ]);

  const active = (blogs || []).filter((b) => {
    if (b.id && deletedSet.has(b.id.toLowerCase().trim())) return false;
    if (b.slug && deletedSet.has(b.slug.toLowerCase().trim())) return false;
    if (b.title && deletedSet.has(b.title.toLowerCase().trim())) return false;
    return true;
  });

  return NextResponse.json(active, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

// POST create a new blog post
export async function POST(request: Request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return unauthorizedResponse();
  }

  try {
    const rawBody = await request.json();
    if (hasProhibitedContent(rawBody)) {
      return NextResponse.json({ error: "Content contains prohibited or explicit language." }, { status: 400 });
    }

    const title = sanitizeString(rawBody.title).slice(0, 200);
    const content = sanitizeString(rawBody.content).slice(0, 20000);
    const category = sanitizeString(rawBody.category || "MUSIC").slice(0, 50);
    const excerpt = sanitizeString(rawBody.excerpt || title).slice(0, 500);
    const author = sanitizeString(rawBody.author || "Dj G-Spark").slice(0, 100);
    const authorRole = sanitizeString(rawBody.authorRole || "Artist & Performer").slice(0, 100);
    const readTime = sanitizeString(rawBody.readTime || "5 MIN READ").slice(0, 50);

    const imageUrl = rawBody.image?.trim() || "/images/dj_hero.jpg";
    if (!isSafeUrl(imageUrl)) {
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
    }

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const blogs = await readJsonFile<BlogPostData[]>("blog.json");

    const slug =
      sanitizeString(rawBody.slug)?.replace(/[^a-z0-9-]+/gi, "-").toLowerCase().slice(0, 120) ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const now = new Date();
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const dateDisplay = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    const dateIso = now.toISOString().split("T")[0];

    const newPost: BlogPostData = {
      id: `BLOG-${Date.now()}`,
      slug,
      title,
      category,
      categorySlug: category.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      date: dateIso,
      dateDisplay,
      readTime,
      author,
      authorRole,
      image: imageUrl,
      excerpt,
      content,
    };

    blogs.unshift(newPost);
    await writeJsonFile("blog.json", blogs);
    await unmarkDeletedBlog([newPost.id, newPost.slug, newPost.title]);

    await logAdminAction({
      action: "CREATE_BLOG",
      adminEmail: admin.email,
      resource: newPost.id,
      status: "SUCCESS",
      details: { title: newPost.title },
    });

    return NextResponse.json({ success: true, post: newPost }, { status: 201 });
  } catch (error) {
    console.error("Create blog error:", error);
    return NextResponse.json({ error: "Failed to create blog post" }, { status: 500 });
  }
}

// PUT edit an existing blog post
export async function PUT(request: Request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return unauthorizedResponse();
  }

  try {
    const rawBody = await request.json();
    if (hasProhibitedContent(rawBody)) {
      return NextResponse.json({ error: "Content contains prohibited or explicit language." }, { status: 400 });
    }

    const { id } = rawBody;
    if (!id) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const blogs = await readJsonFile<BlogPostData[]>("blog.json");
    const index = blogs.findIndex((b) => b.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    const safeImage = rawBody.image ? rawBody.image.trim() : blogs[index].image;
    if (!isSafeUrl(safeImage)) {
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
    }

    const category = rawBody.category ? sanitizeString(rawBody.category).slice(0, 50) : blogs[index].category;

    blogs[index] = {
      ...blogs[index],
      title: rawBody.title ? sanitizeString(rawBody.title).slice(0, 200) : blogs[index].title,
      slug: rawBody.slug ? sanitizeString(rawBody.slug).replace(/[^a-z0-9-]+/gi, "-").toLowerCase().slice(0, 120) : blogs[index].slug,
      category,
      categorySlug: category.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      excerpt: rawBody.excerpt ? sanitizeString(rawBody.excerpt).slice(0, 500) : blogs[index].excerpt,
      content: rawBody.content ? sanitizeString(rawBody.content).slice(0, 20000) : blogs[index].content,
      image: safeImage,
      author: rawBody.author ? sanitizeString(rawBody.author).slice(0, 100) : blogs[index].author,
      authorRole: rawBody.authorRole ? sanitizeString(rawBody.authorRole).slice(0, 100) : blogs[index].authorRole,
      readTime: rawBody.readTime ? sanitizeString(rawBody.readTime).slice(0, 50) : blogs[index].readTime,
    };

    await writeJsonFile("blog.json", blogs);
    await unmarkDeletedBlog([blogs[index].id, blogs[index].slug, blogs[index].title]);

    await logAdminAction({
      action: "UPDATE_BLOG",
      adminEmail: admin.email,
      resource: id,
      status: "SUCCESS",
      details: { title: blogs[index].title },
    });

    return NextResponse.json({ success: true, post: blogs[index] });
  } catch (error) {
    console.error("Edit blog error:", error);
    return NextResponse.json({ error: "Failed to edit blog post" }, { status: 500 });
  }
}

// DELETE a blog post
export async function DELETE(request: Request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug") || undefined;
    const title = searchParams.get("title") || undefined;

    if (!id) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    await purgeBlogEverywhere(id, slug, title);

    await logAdminAction({
      action: "DELETE_BLOG",
      adminEmail: admin.email,
      resource: id,
      status: "SUCCESS",
      details: { slug, title },
    });

    return NextResponse.json({ success: true, message: "Blog post deleted permanently" });
  } catch (error) {
    console.error("Delete blog error:", error);
    return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 });
  }
}
