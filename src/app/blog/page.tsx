"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import rawBlog from "@/data/blog.json";
import { BlogPostItem } from "@/types";
import { getMergedBlogs } from "@/lib/clientStorage";
import { Clock, User, ArrowRight } from "lucide-react";

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPostItem[]>(() => {
    return getMergedBlogs(rawBlog as unknown as BlogPostItem[]);
  });
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const merged = getMergedBlogs(rawBlog as unknown as BlogPostItem[]);
    setPosts(merged);

    fetch("/api/blogs", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPosts(getMergedBlogs(data));
        }
      })
      .catch(() => {});
  }, []);

  const filtered = posts.filter((p) => {
    if (filter === "all") return true;
    return p.category?.toLowerCase().includes(filter);
  });

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 sm:px-10 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-bold tracking-[0.24em] text-[#00B4D8] uppercase block mb-3">
          EDITORIAL & DISPATCHES
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-4">
          STUDIO <span className="text-[#00E5FF]">CHRONICLES</span>
        </h1>
        <p className="text-sm sm:text-base text-[#8A8D93] leading-relaxed">
          Deep dives into sound architecture, analog modular synthesis, international festival culture, and reflections from the touring universe.
        </p>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          {[
            { id: "all", label: `ALL ARTICLES (${posts.length})` },
            { id: "behind", label: "BEHIND THE SCENES" },
            { id: "music", label: "PRODUCTION" },
            { id: "events", label: "TOUR DIARIES" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-5 py-2 rounded-full text-xs font-bold tracking-[0.14em] uppercase transition-all ${
                filter === tab.id
                  ? "bg-[#00E5FF] text-black shadow-spark"
                  : "bg-white/5 text-[#8A8D93] hover:text-white border border-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((post) => (
          <article
            key={post.id}
            className="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-[#00E5FF]/40 transition-all duration-300 flex flex-col justify-between group"
          >
            <div className="relative h-60 w-full overflow-hidden bg-black/60">
              <img
                src={post.image || "/images/dj_hero.jpg"}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-bold tracking-wider text-[#00B4D8] uppercase border border-white/10">
                {post.category}
              </span>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 text-xs text-[#8A8D93] font-mono mb-2">
                  <span>{post.dateDisplay}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>

                <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-[#00B4D8] transition-colors mb-3">
                  <Link href={`/blog/${post.slug || post.id}`}>
                    {post.title}
                  </Link>
                </h3>

                <p className="text-xs text-[#8A8D93] leading-relaxed line-clamp-3 mb-6">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  {post.author}
                </span>
                <Link
                  href={`/blog/${post.slug || post.id}`}
                  className="text-xs font-bold tracking-wider text-[#00B4D8] hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}