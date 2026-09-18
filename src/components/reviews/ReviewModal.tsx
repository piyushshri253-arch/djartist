"use client";

import React, { useState } from "react";
import { Star, X, CheckCircle2, ShieldCheck, Sparkles, Loader2 } from "lucide-react";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

const RATING_LABELS = [
  "",
  "1 Star — Fair Effort",
  "2 Stars — Good Vibe",
  "3 Stars — High Energy",
  "4 Stars — Truly Electrifying",
  "5 Stars — Legendary / Unstoppable Arena Climax",
];

export default function ReviewModal({ isOpen, onClose, onSubmitted }: ReviewModalProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("Festival Attendee");
  const [customRole, setCustomRole] = useState("");
  const [organization, setOrganization] = useState("");
  const [event, setEvent] = useState("Sunburn Goa Mainstage");
  const [customEvent, setCustomEvent] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [quote, setQuote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage("Please enter your name (at least 2 characters).");
      return;
    }

    if (!quote.trim() || quote.trim().length < 10) {
      setErrorMessage("Please write a review with at least 10 characters.");
      return;
    }

    const finalRole = role === "Other" ? customRole.trim() || "Music Fan" : role;
    const finalEvent = event === "Other" ? customEvent.trim() || "DJ G Spark Live Tour" : event;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          role: finalRole,
          organization: organization.trim(),
          event: finalEvent,
          rating,
          quote: quote.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsSuccess(true);
        if (onSubmitted) onSubmitted();
      } else {
        setErrorMessage(data.error || "Failed to submit review. Please try again.");
      }
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setName("");
    setRole("Festival Attendee");
    setCustomRole("");
    setOrganization("");
    setEvent("Sunburn Goa Mainstage");
    setCustomEvent("");
    setRating(5);
    setQuote("");
    setIsSuccess(false);
    setErrorMessage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={handleResetAndClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-[#0d0d14] border border-[#00E5FF]/40 rounded-3xl shadow-[0_20px_80px_rgba(0, 229, 255, 0.25)] overflow-hidden z-10 my-auto text-white">
        {/* Glow Header Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#00E5FF] via-[#FFA030] to-[#00B4D8]" />

        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-[#00E5FF] hover:text-[#00E5FF] flex items-center justify-center transition-colors text-white/70"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          /* Success Screen */
          <div className="p-8 sm:p-10 text-center flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-[#10B981]/15 border border-[#10B981]/40 flex items-center justify-center mb-6 text-[#10B981] shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="px-3.5 py-1 rounded-full bg-[#00E5FF]/15 border border-[#00E5FF]/30 text-[#00B4D8] text-xs font-mono uppercase tracking-[0.2em] mb-3">
              REVIEW RECEIVED
            </span>

            <h3 className="font-heading font-black text-2xl sm:text-3xl text-white uppercase mb-3">
              THANK YOU FOR YOUR REVIEW!
            </h3>

            <p className="text-sm text-[#A0A0A8] leading-relaxed max-w-md mb-6">
              Your feedback has been sent directly to the <strong className="text-white">DJ G SPARK Artist Management Team</strong>. Once verified, it will be published live on the official website.
            </p>

            <div className="p-4 rounded-xl bg-black/40 border border-white/10 w-full mb-6 text-left flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#00E5FF] shrink-0 mt-0.5" />
              <div className="text-xs text-[#999999]">
                <strong className="text-white block mb-0.5">Verified Artist Moderation Queue</strong>
                Reviews are moderated to prevent automated spam and ensure authentic crowd feedback. You will see it live shortly!
              </div>
            </div>

            <button
              onClick={handleResetAndClose}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-black font-heading font-bold text-xs tracking-[0.2em] uppercase hover:brightness-110 transition-all shadow-[0_0_25px_rgba(0, 229, 255, 0.4)]"
            >
              BACK TO WEBSITE
            </button>
          </div>
        ) : (
          /* Submission Form */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[11px] font-mono tracking-[0.2em] text-[#00B4D8] uppercase mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>COMMUNITY & INDUSTRY ACCLAIM</span>
              </div>
              <h2 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-tight text-white">
                RATE & REVIEW DJ G SPARK
              </h2>
              <p className="text-xs sm:text-sm text-[#888899] mt-1">
                Share your live arena experience, festival memory, or promoter verdict.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-mono">
                {errorMessage}
              </div>
            )}

            {/* Star Rating Picker */}
            <div className="mb-6 p-4 rounded-2xl bg-black/40 border border-white/10">
              <label className="block text-xs font-mono tracking-[0.16em] text-[#AAAAAA] uppercase mb-2">
                YOUR RATING *
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                          isFilled
                            ? "fill-[#00E5FF] text-[#00E5FF] drop-shadow-[0_0_12px_rgba(0, 229, 255, 0.6)]"
                            : "text-white/20 hover:text-white/40"
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="ml-3 text-xs font-mono text-[#00B4D8] font-semibold">
                  {RATING_LABELS[hoverRating || rating]}
                </span>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-mono tracking-[0.16em] text-[#AAAAAA] uppercase mb-1.5">
                  YOUR FULL NAME *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aryan Kapoor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141420] border border-white/15 focus:border-[#00E5FF] text-white text-sm placeholder-white/30 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono tracking-[0.16em] text-[#AAAAAA] uppercase mb-1.5">
                  WHO ARE YOU? *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141420] border border-white/15 focus:border-[#00E5FF] text-white text-sm focus:outline-none transition-colors"
                >
                  <option value="Festival Attendee">Festival Attendee / Concert Goer</option>
                  <option value="Club VIP Guest">Club VIP Guest</option>
                  <option value="Festival Director / Promoter">Festival Director / Promoter</option>
                  <option value="Venue Operator">Venue / Arena Operator</option>
                  <option value="Music Journalist / Press">Music Journalist / Press</option>
                  <option value="Verified Fan">Verified Superfan</option>
                  <option value="Other">Other (Custom Title)</option>
                </select>
              </div>
            </div>

            {role === "Other" && (
              <div className="mb-4">
                <label className="block text-xs font-mono tracking-[0.16em] text-[#AAAAAA] uppercase mb-1.5">
                  CUSTOM TITLE / ROLE
                </label>
                <input
                  type="text"
                  placeholder="e.g. Stage Lighting Engineer"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141420] border border-white/15 focus:border-[#00E5FF] text-white text-sm placeholder-white/30 focus:outline-none transition-colors"
                />
              </div>
            )}

            {/* Event & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-mono tracking-[0.16em] text-[#AAAAAA] uppercase mb-1.5">
                  EVENT / CONCERT ATTENDED
                </label>
                <select
                  value={event}
                  onChange={(e) => setEvent(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141420] border border-white/15 focus:border-[#00E5FF] text-white text-sm focus:outline-none transition-colors"
                >
                  <option value="Sunburn Goa Mainstage">Sunburn Goa Mainstage</option>
                  <option value="Coca-Cola Arena Dubai">Coca-Cola Arena Dubai</option>
                  <option value="Tomorrowland Sunset Stage">Tomorrowland Sunset Stage</option>
                  <option value="Spark Theory Delhi Arena">Spark Theory Delhi Arena</option>
                  <option value="Mumbai Superdome Headline">Mumbai Superdome Headline</option>
                  <option value="Other">Other Concert / Festival</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono tracking-[0.16em] text-[#AAAAAA] uppercase mb-1.5">
                  CITY OR COMPANY (OPTIONAL)
                </label>
                <input
                  type="text"
                  placeholder="e.g. New Delhi / Percept"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141420] border border-white/15 focus:border-[#00E5FF] text-white text-sm placeholder-white/30 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {event === "Other" && (
              <div className="mb-4">
                <label className="block text-xs font-mono tracking-[0.16em] text-[#AAAAAA] uppercase mb-1.5">
                  CUSTOM EVENT NAME
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bangalore Club Velocity"
                  value={customEvent}
                  onChange={(e) => setCustomEvent(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141420] border border-white/15 focus:border-[#00E5FF] text-white text-sm placeholder-white/30 focus:outline-none transition-colors"
                />
              </div>
            )}

            {/* Review Quote */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono tracking-[0.16em] text-[#AAAAAA] uppercase">
                  YOUR HONEST REVIEW *
                </label>
                <span className="text-[11px] font-mono text-[#777788]">
                  {quote.length}/800 chars
                </span>
              </div>
              <textarea
                required
                rows={4}
                maxLength={800}
                placeholder="Describe the energy, the crowd, sound, lighting, or your live concert experience..."
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#141420] border border-white/15 focus:border-[#00E5FF] text-white text-sm placeholder-white/30 focus:outline-none transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Security Moderation Notice */}
            <div className="p-3.5 rounded-xl bg-[#00E5FF]/5 border border-[#00E5FF]/20 flex items-start gap-2.5 mb-6 text-xs text-[#9999AA]">
              <ShieldCheck className="w-4 h-4 text-[#00B4D8] shrink-0 mt-0.5" />
              <span>
                To ensure quality and prevent spam, all submitted reviews go to the admin moderation queue before appearing live on the website.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-white/80 hover:text-white text-xs font-mono uppercase tracking-[0.16em] transition-colors"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-7 py-3 rounded-xl bg-[#00E5FF] hover:bg-white text-black font-heading font-black text-xs tracking-[0.2em] uppercase transition-all shadow-[0_0_20px_rgba(0, 229, 255, 0.4)] disabled:opacity-60 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>SUBMITTING...</span>
                  </>
                ) : (
                  <span>SUBMIT REVIEW</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

