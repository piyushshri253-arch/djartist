import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { readJsonFile, writeJsonFile } from "@/lib/serverData";

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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const blogs = await readJsonFile<BlogPostData[]>("blog.json");
  return NextResponse.json(blogs);
}

// POST create a new blog post
export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, category, excerpt, content, image, author, authorRole, readTime } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const blogs = await readJsonFile<BlogPostData[]>("blog.json");

    const slug =
      body.slug?.trim() ||
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
      category: category || "MUSIC",
      categorySlug: (category || "music").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      date: dateIso,
      dateDisplay,
      readTime: readTime || "5 MIN READ",
      author: author || "Dj G-spark",
      authorRole: authorRole || "Artist & Performer",
      image: image || "/images/dj_hero.jpg",
      excerpt: excerpt || title,
      content,
    };

    // Prepend to list
    blogs.unshift(newPost);
    await writeJsonFile("blog.json", blogs);

    return NextResponse.json({ success: true, post: newPost }, { status: 201 });
  } catch (error) {
    console.error("Create blog error:", error);
    return NextResponse.json({ error: "Failed to create blog post" }, { status: 500 });
  }
}

// PUT edit an existing blog post
export async function PUT(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, title, category, excerpt, content, image, author, authorRole, readTime, slug } = body;

    if (!id) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const blogs = await readJsonFile<BlogPostData[]>("blog.json");
    const index = blogs.findIndex((b) => b.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    blogs[index] = {
      ...blogs[index],
      title: title ?? blogs[index].title,
      slug: slug ?? blogs[index].slug,
      category: category ?? blogs[index].category,
      categorySlug: category ? category.toLowerCase().replace(/[^a-z0-9]+/g, "-") : blogs[index].categorySlug,
      excerpt: excerpt ?? blogs[index].excerpt,
      content: content ?? blogs[index].content,
      image: image ?? blogs[index].image,
      author: author ?? blogs[index].author,
      authorRole: authorRole ?? blogs[index].authorRole,
      readTime: readTime ?? blogs[index].readTime,
    };

    await writeJsonFile("blog.json", blogs);
    return NextResponse.json({ success: true, post: blogs[index] });
  } catch (error) {
    console.error("Edit blog error:", error);
    return NextResponse.json({ error: "Failed to edit blog post" }, { status: 500 });
  }
}

// DELETE a blog post
export async function DELETE(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const blogs = await readJsonFile<BlogPostData[]>("blog.json");
    const filtered = blogs.filter((b) => b.id !== id);

    if (filtered.length === blogs.length) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await writeJsonFile("blog.json", filtered);
    return NextResponse.json({ success: true, message: "Blog post deleted" });
  } catch (error) {
    console.error("Delete blog error:", error);
    return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 });
  }
}
