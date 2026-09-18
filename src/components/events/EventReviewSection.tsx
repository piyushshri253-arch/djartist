"use client";

import { useState, useEffect } from "react";
import { Star, CheckCircle2, AlertCircle, Sparkles, MessageSquare, User, ShieldCheck } from "lucide-react";
import { ReviewItem } from "@/types";

interface EventReviewSectionProps {
  eventId: string;
  eventSlug: string;
  eventTitle: string;
}

export function EventReviewSection({ eventId, eventSlug, eventTitle }: EventReviewSectionProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<{ total: number; averageRating: number; breakdown: Record<number, number> }>({
    total: 0,
    averageRating: 5.0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [role, setRole] = useState("Concert Attendee");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/reviews?eventSlug=${encodeURIComponent(eventSlug)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load event reviews:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [eventSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess(false);

    if (!name.trim() || name.trim().length < 2) {
      setSubmitError("Please enter your name (minimum 2 characters).");
      return;
    }

    if (!reviewText.trim() || reviewText.trim().length < 10) {
      setSubmitError("Please write a detailed review (minimum 10 characters).");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          rating,
          review: reviewText.trim(),
          role: role.trim() || "Concert Attendee",
          targetType: "event",
          eventId,
          eventSlug,
          eventTitle,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review.");
      }

      setSubmitSuccess(true);
      setName("");
      setEmail("");
      setReviewText("");
      setRating(5);
    } catch (err: any) {
      setSubmitError(err.message || "An error occurred while submitting your review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingDescriptions = ["", "Disappointing", "Fair", "Good Performance", "Great Show!", "Phenomenal 360 Spectacle!"];

  return (
    <div className="pt-16 border-t border-white/10 space-y-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6A00]/10 border border-[#FF6A00]/30 text-xs font-mono font-bold tracking-[0.2em] text-[#FF8400] uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>COMMUNITY FEEDBACK & AUDIENCE RATINGS</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight uppercase">
            CONCERT <span className="text-[#FF6A00]">REVIEWS</span> & RATINGS
          </h2>
          <p className="text-sm text-[#969696] max-w-2xl mt-2 leading-relaxed">
            Verified fan experiences, acoustics ratings, and crowd impressions from {eventTitle}. Submit your feedback below.
          </p>
        </div>

        {/* Overall Rating Pill */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="text-center">
            <div className="text-3xl font-black text-white font-mono">{stats.averageRating.toFixed(1)}</div>
            <div className="flex items-center justify-center gap-0.5 text-[#FF8400] mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    s <= Math.round(stats.averageRating) ? "fill-[#FF8400] text-[#FF8400]" : "text-white/20"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-[#888888] font-mono mt-1 block">
              {stats.total} Verified {stats.total === 1 ? "Review" : "Reviews"}
            </span>
          </div>
        </div>
      </div>

      {/* Review Submission Form & Review List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Submit Review Form */}
        <div className="lg:col-span-5">
          <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#FF8400]" />
                <span>Rate This Experience</span>
              </h3>
              <p className="text-xs text-[#888888] mt-1">
                Attended this performance? Share your rating and review with fellow fans.
              </p>
            </div>

            {submitSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Review Submitted for Moderation!</strong>
                  <span>Your rating has been safely recorded. It will appear publicly on the website once approved by our administration team.</span>
                </div>
              </div>
            )}

            {submitError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Star Selector */}
              <div>
                <label className="block text-[#AAAAAA] uppercase font-mono mb-2">
                  Overall Rating (1 to 5 Stars) *
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-white hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= (hoverRating || rating)
                              ? "fill-[#FF8400] text-[#FF8400]"
                              : "text-white/20"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="font-mono text-xs font-bold text-[#FF8400] ml-2">
                    {ratingDescriptions[hoverRating || rating]}
                  </span>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[#AAAAAA] uppercase font-mono mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sahil Kapoor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#111116] border border-white/10 focus:border-[#FF6A00] rounded-xl px-4 py-2.5 text-white focus:outline-none transition-colors placeholder:text-[#555]"
                />
              </div>

              {/* Email (Private) */}
              <div>
                <label className="block text-[#AAAAAA] uppercase font-mono mb-1">
                  Email Address <span className="text-[#666]">(Private, for verification)</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. sahil@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#111116] border border-white/10 focus:border-[#FF6A00] rounded-xl px-4 py-2.5 text-white focus:outline-none transition-colors placeholder:text-[#555]"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-[#AAAAAA] uppercase font-mono mb-1">Attendance Type</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#111116] border border-white/10 focus:border-[#FF6A00] rounded-xl px-4 py-2.5 text-white focus:outline-none transition-colors"
                >
                  <option value="Concert Attendee">Concert Attendee (Arena Floor)</option>
                  <option value="VIP Lounge Guest">VIP Lounge Guest</option>
                  <option value="Festival Promoter">Festival Promoter / Partner</option>
                  <option value="Music Journalist">Music Journalist / Critic</option>
                  <option value="Verified Fan">Superfan / Producer</option>
                </select>
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-[#AAAAAA] uppercase font-mono mb-1">
                  Your Review / Experience *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="How was the sound clarity, lighting rig, crowd energy, and track selection?"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full bg-[#111116] border border-white/10 focus:border-[#FF6A00] rounded-xl px-4 py-2.5 text-white focus:outline-none transition-colors placeholder:text-[#555] leading-relaxed"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#FF8400] text-black font-heading font-bold text-xs tracking-[0.16em] uppercase hover:shadow-spark transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Submitting Review...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Submit Review for Verification</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-[#666] text-center font-mono">
                🔒 Reviews undergo editorial moderation to eliminate spam and preserve verified community credibility.
              </p>
            </form>
          </div>
        </div>

        {/* Right Column: Approved Reviews Display */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="font-heading font-bold text-base text-white uppercase tracking-wider">
              Approved Reviews ({reviews.length})
            </h3>
            <span className="text-xs text-[#888] font-mono">100% Verified Community</span>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-sm text-[#888]">Loading audience reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center text-[#FF8400]">
                <Star className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">Be the first to review this concert!</h4>
              <p className="text-xs text-[#888] max-w-sm mx-auto">
                No verified reviews published yet. Submit your thoughts using the form to have your review featured.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-2xl bg-[#0e0e14] border border-white/10 hover:border-[#FF6A00]/30 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6A00] to-[#FF8400] text-black font-black flex items-center justify-center font-heading text-sm shadow-spark">
                        {rev.initials || "DJ"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">{rev.name}</h4>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold uppercase ${rev.badgeColor || "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"}`}>
                            {rev.badge || "VERIFIED ATTENDEE"}
                          </span>
                        </div>
                        <span className="text-xs text-[#888888]">{rev.role}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 text-[#FF8400]">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating ? "fill-[#FF8400] text-[#FF8400]" : "text-white/20"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-[#D0D0D8] leading-relaxed italic">
                    &ldquo;{rev.quote}&rdquo;
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-[#666] font-mono pt-2 border-t border-white/5">
                    <span>{rev.event || eventTitle}</span>
                    <span>{rev.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
