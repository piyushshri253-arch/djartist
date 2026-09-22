"use client";

import { useState, useEffect } from "react";
import { ReviewItem } from "@/types";
import {
  Star,
  MessageSquare,
  ShieldCheck,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ArticleReviewSectionProps {
  articleSlug: string;
  articleTitle: string;
}

export function ArticleReviewSection({ articleSlug, articleTitle }: ArticleReviewSectionProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    averageRating: number;
    breakdown: Record<number, number>;
  }>({
    total: 0,
    averageRating: 5.0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [city, setCity] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [quote, setQuote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch approved reviews for this article
  const loadReviews = () => {
    setIsLoading(true);
    fetch(`/api/reviews?articleSlug=${encodeURIComponent(articleSlug)}`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.reviews)) {
          setReviews(data.reviews);
          if (data.stats) {
            setStats(data.stats);
          }
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (articleSlug) {
      loadReviews();
    }
  }, [articleSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (name.trim().length < 2) {
      setSubmitError("Please enter your name (minimum 2 characters).");
      return;
    }

    if (quote.trim().length < 10) {
      setSubmitError("Please write at least 10 characters in your review.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "article",
          articleSlug,
          articleTitle,
          name: name.trim(),
          role: role.trim() || "Chronicle Reader",
          organization: city.trim() || undefined,
          rating,
          quote: quote.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit review");
      }

      setSubmitSuccess(true);
      setName("");
      setRole("");
      setCity("");
      setQuote("");
      setRating(5);
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingDescriptions: Record<number, string> = {
    1: "1★ - Poor / Incomplete",
    2: "2★ - Fair / Needs Depth",
    3: "3★ - Good Technical Breakdown",
    4: "4★ - Very Strong Sound Architecture",
    5: "5★ - Masterpiece! Essential Reading",
  };

  return (
    <section className="my-16 pt-10 border-t border-white/10" id="reviews">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00B4D8] uppercase tracking-wider mb-2">
            <MessageSquare className="w-4 h-4" />
            <span>COMMUNITY DISPATCH // READER REVIEWS</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ARTICLE RATINGS &amp; REVIEWS
          </h3>
          <p className="text-xs sm:text-sm text-[#8A8D93] mt-1">
            Verified sound engineers, producers, and festival fans review this dispatch.
          </p>
        </div>

        <button
          onClick={() => {
            setIsFormOpen(!isFormOpen);
            setSubmitSuccess(false);
            setSubmitError(null);
          }}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider shadow-spark flex items-center justify-center gap-2 transition-all self-start sm:self-auto"
        >
          <Star className="w-4 h-4 fill-black" />
          <span>{isFormOpen ? "CLOSE REVIEW FORM" : "WRITE A REVIEW"}</span>
          {isFormOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Review Submission Form Drawer */}
      {isFormOpen && (
        <div className="mb-10 p-6 sm:p-8 rounded-2xl glass-card border border-[#00E5FF]/40 bg-[#0d0d14] relative shadow-[0_0_40px_rgba(0, 229, 255, 0.15)] animate-in fade-in slide-in-from-top-4 duration-300">
          {submitSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-black text-white">Review Submitted for Moderation!</h4>
              <p className="text-xs sm:text-sm text-[#b4b4c0] max-w-md mx-auto leading-relaxed">
                Thank you for rating this chronicle. To maintain authenticity and protect our community, Dj G-Spark management reviews all comments before publishing live.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setIsFormOpen(false);
                    setSubmitSuccess(false);
                  }}
                  className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase font-mono transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/10">
                <div>
                  <h4 className="text-lg font-bold text-white">Rate &amp; Review This Chronicle</h4>
                  <span className="text-xs text-[#8A8D93]">
                    Article: <strong className="text-white">{articleTitle}</strong>
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#00B4D8] bg-[#00E5FF]/10 border border-[#00E5FF]/30 px-2.5 py-1 rounded-full uppercase">
                  🛡️ MODERATED BY MANAGEMENT
                </span>
              </div>

              {submitError && (
                <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-mono font-bold text-[#b4b4c0] uppercase tracking-wider mb-2">
                  SELECT STAR RATING *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          (hoverRating || rating) >= star
                            ? "fill-[#00E5FF] text-[#00E5FF] drop-shadow-[0_0_8px_rgba(0, 229, 255, 0.6)]"
                            : "text-white/20 hover:text-white/40"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-mono text-[#00B4D8] ml-3 hidden sm:inline-block">
                    {ratingDescriptions[hoverRating || rating]}
                  </span>
                </div>
              </div>

              {/* Name & Role Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-[#8A8D93] uppercase mb-1.5">
                    YOUR FULL NAME *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    required
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/25 focus:border-[#00E5FF] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-[#8A8D93] uppercase mb-1.5">
                    ROLE / PROFESSION
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Audio Engineer / Fan"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/25 focus:border-[#00E5FF] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-[#8A8D93] uppercase mb-1.5">
                    CITY / LOCATION
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Amsterdam, NL"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/25 focus:border-[#00E5FF] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Review Textarea */}
              <div>
                <label className="block text-[11px] font-mono font-bold text-[#8A8D93] uppercase mb-1.5">
                  YOUR REVIEW &amp; FEEDBACK ON THIS DISPATCH *
                </label>
                <textarea
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="Share your thoughts on the sound design, stage technology, or touring story mentioned in this chronicle..."
                  rows={4}
                  required
                  className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-xs text-white placeholder-white/25 focus:border-[#00E5FF] focus:outline-none transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Moderation Notice & Submit Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-white/10">
                <div className="flex items-center gap-2 text-[11px] text-[#8A8D93]">
                  <ShieldCheck className="w-4 h-4 text-[#00B4D8] flex-shrink-0" />
                  <span>Submissions are sent to the Admin Dashboard for moderation before going live.</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#00E5FF] hover:bg-[#00B4D8] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-spark disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? (
                    <span>SUBMITTING...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>SUBMIT FOR APPROVAL</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Ratings Scoreboard */}
      <div className="p-6 rounded-2xl glass-card border border-white/10 bg-black/40 mb-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Big Score Box */}
        <div className="md:col-span-4 text-center md:border-r md:border-white/10 md:pr-6">
          <span className="text-5xl font-black text-white font-mono tracking-tight">
            {reviews.length > 0 ? stats.averageRating : "5.0"}
          </span>
          <div className="flex items-center justify-center gap-1 my-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-[#00E5FF] text-[#00E5FF]" />
            ))}
          </div>
          <span className="text-xs text-[#8A8D93] font-mono block">
            {reviews.length > 0
              ? `${stats.total} verified reader review${stats.total === 1 ? "" : "s"}`
              : "Official Chronicle Rating"}
          </span>
        </div>

        {/* 5-Star Breakdown Bars */}
        <div className="md:col-span-8 space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = stats.breakdown[stars] || 0;
            const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : stars === 5 ? 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-3 text-xs font-mono text-[#8A8D93]">
                <span className="w-6 text-right font-bold text-white">{stars}★</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-right text-[11px]">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Approved Reviews Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-xs font-mono text-[#8A8D93]">
          LOADING READER DISPATCHES...
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white/[0.02] border border-dashed border-white/15 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-[#00B4D8] mx-auto opacity-70" />
          <h4 className="text-base font-bold text-white uppercase">Be The First To Review</h4>
          <p className="text-xs text-[#8A8D93] max-w-sm mx-auto leading-relaxed">
            No reader reviews have been published yet for this chronicle. Read the article and share your thoughts!
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-[#00E5FF]/20 border border-white/15 hover:border-[#00E5FF]/50 text-xs font-bold text-[#00B4D8] transition-all"
          >
            Leave a Review
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-2xl glass-card border border-white/10 hover:border-[#00E5FF]/30 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header: Stars + Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#00E5FF] text-[#00E5FF]" />
                    ))}
                  </div>

                  <span className="text-[10px] font-mono tracking-wider px-2.5 py-0.5 rounded-full border text-[#00B4D8] bg-[#00E5FF]/10 border-[#00E5FF]/30 font-bold uppercase">
                    {rev.badge || "ARTICLE READER"}
                  </span>
                </div>

                {/* Quote */}
                <p className="text-xs sm:text-sm text-[#d4d4dc] leading-relaxed mb-6 italic">
                  &quot;{rev.quote}&quot;
                </p>
              </div>

              {/* Author Strip */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#151520] border border-[#00E5FF]/40 flex items-center justify-center font-mono font-bold text-xs text-[#00B4D8]">
                    {rev.initials || rev.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-white block truncate max-w-[150px]">
                      {rev.name}
                    </span>
                    <span className="text-[11px] text-[#8A8D93] block truncate max-w-[150px]">
                      {rev.role} {rev.organization ? `• ${rev.organization}` : ""}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-[#777777]">
                  {rev.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
