"use client";

import { useState } from "react";
import { X, ShieldCheck, Ticket, User, Phone, Mail, FileText, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  eventCity: string;
  eventDate: string;
  basePrice?: number;
  priceINR?: string | number;
  priceUSD?: string | number;
  showPrice?: boolean;
}

export function TicketModal({
  isOpen,
  onClose,
  eventTitle,
  eventCity,
  eventDate,
  basePrice = 45,
  priceINR = "2,499",
  priceUSD = "35",
  showPrice = true,
}: TicketModalProps) {
  // Tier selection
  const [tierMultiplier, setTierMultiplier] = useState(2.2);
  const [tierName, setTierName] = useState("VIP Elevated Lounge");
  const [quantity, setQuantity] = useState(2);

  // Customer contact fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedLeadId, setConfirmedLeadId] = useState("");
  const [whatsappDirectUrl, setWhatsappDirectUrl] = useState("");
  const [formError, setFormError] = useState("");

  if (!isOpen) return null;

  const CLIENT_WHATSAPP_NUMBER = "919540681934";
  const CLIENT_WHATSAPP_DISPLAY = "+91 95406 81934";

  // Numerical base calculation
  const numericINR = Number(String(priceINR).replace(/[^0-9]/g, "")) || 2499;
  const numericUSD = Number(String(priceUSD).replace(/[^0-9]/g, "")) || 35;

  const inrPerTicket = Math.round(numericINR * (tierMultiplier === 1 ? 1 : tierMultiplier === 2.2 ? 2.4 : 4));
  const usdPerTicket = Math.round(numericUSD * (tierMultiplier === 1 ? 1 : tierMultiplier === 2.2 ? 2.3 : 3.8));

  const totalINR = inrPerTicket * quantity;
  const totalUSD = usdPerTicket * quantity;

  const formatWhatsAppMessage = (refId: string) => {
    const priceDisplay = showPrice
      ? `₹${totalINR.toLocaleString("en-IN")} ($${totalUSD} USD)`
      : "Price on Request / VIP Concierge";

    const lines = [
      "🎟️ *Dj G-Spark — OFFICIAL PASS RESERVATION* 🎟️",
      "━━━━━━━━━━━━━━━━━━━━━━━━━",
      `⚡ *Event:* ${eventTitle}`,
      `📍 *Location & Date:* ${eventCity} • ${eventDate}`,
      `🎫 *Pass Category:* ${tierName}`,
      `🔢 *Passes Count:* ${quantity} Pass${quantity > 1 ? "es" : ""}`,
      `💰 *Estimated Total:* ${priceDisplay}`,
      "─────────────────────────",
      `👤 *Customer Name:* ${name.trim()}`,
      `📱 *Mobile / WhatsApp:* ${phone.trim()}`,
      email.trim() ? `✉️ *Email:* ${email.trim()}` : "",
      notes.trim() ? `📝 *Special Notes:* ${notes.trim()}` : "",
      `🆔 *Booking Ref:* ${refId}`,
      "━━━━━━━━━━━━━━━━━━━━━━━━━",
      "⚡ *Direct booking lead from Dj G-Spark Official Website*",
    ].filter(Boolean);

    return lines.join("\n");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Please enter your full name");
      return;
    }

    if (!phone.trim() || phone.trim().length < 8) {
      setFormError("Please enter a valid Phone / WhatsApp contact number");
      return;
    }

    setIsSubmitting(true);

    const refId = `SPARK-${Date.now().toString(36).toUpperCase()}`;
    setConfirmedLeadId(refId);

    const waText = formatWhatsAppMessage(refId);
    const waUrl = `https://api.whatsapp.com/send?phone=${CLIENT_WHATSAPP_NUMBER}&text=${encodeURIComponent(waText)}`;
    setWhatsappDirectUrl(waUrl);

    // Automatically launch WhatsApp with prefilled ticket booking details
    if (typeof window !== "undefined") {
      window.open(waUrl, "_blank");
    }

    try {
      // Save lead to backend which automatically handles client routing
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "pass_booking",
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          eventTitle,
          eventCity,
          eventDate,
          tier: tierName,
          quantity,
          totalPrice: showPrice ? `₹${totalINR.toLocaleString("en-IN")} / $${totalUSD}` : "Price On Request",
          notes: notes.trim(),
        }),
      });
    } catch (err) {
      console.error("Lead submission notice:", err);
    } finally {
      setIsSubmitting(false);
      setIsSuccess(true);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setName("");
    setPhone("");
    setEmail("");
    setNotes("");
    setFormError("");
    setConfirmedLeadId("");
    setWhatsappDirectUrl("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-[#0f0f15] border border-white/15 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] z-10 my-auto max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-[#12121a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/15 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF]">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-[0.2em] text-[#00B4D8] uppercase">
                <Sparkles className="w-3 h-3" />
                <span>OFFICIAL ARENA PASSES</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                {eventTitle}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8A8D93] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-grow space-y-6">
          {isSuccess ? (
            /* ============================================================ */
            /* CELEBRATORY THANK YOU SCREEN                                 */
            /* ============================================================ */
            <div className="py-6 text-center flex flex-col items-center gap-5 animate-in fade-in zoom-in-95 duration-300">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#00FF88]/20 to-[#00E5FF]/20 border-2 border-[#00FF88] flex items-center justify-center text-[#00FF88] shadow-[0_0_40px_rgba(0,255,136,0.35)]">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#00E5FF] flex items-center justify-center text-black shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 fill-black" />
                </div>
              </div>

              <div>
                <span className="px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-mono tracking-widest text-emerald-400 uppercase font-bold inline-block mb-2">
                  PASS RESERVATION RECEIVED
                </span>
                <h3 className="font-heading font-black text-3xl text-white tracking-tight uppercase">
                  THANK YOU!
                </h3>
                <p className="text-xs sm:text-sm text-[#CCCCCC] max-w-md mx-auto mt-2 leading-relaxed">
                  Thank you, <strong className="text-white">{name}</strong>! Your pass reservation request has been submitted successfully.
                </p>
                <p className="text-[11px] text-emerald-400/90 font-mono mt-1">
                  ✓ Management team notified on WhatsApp • Concierge will contact you shortly
                </p>
              </div>

              {/* Order Confirmation Card */}
              <div className="w-full p-5 rounded-xl bg-white/[0.03] border border-white/10 text-left text-xs space-y-2.5">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[#888888]">Event:</span>
                  <span className="text-white font-semibold">{eventTitle}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[#888888]">Location & Date:</span>
                  <span className="text-white font-semibold">{eventCity} • {eventDate}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[#888888]">Pass Tier:</span>
                  <span className="text-[#00B4D8] font-bold">{tierName} × {quantity}</span>
                </div>
                {showPrice && (
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-[#888888]">Estimated Total:</span>
                    <span className="text-white font-mono font-bold">
                      ₹{totalINR.toLocaleString("en-IN")} <span className="text-[#888888] font-normal">(${totalUSD})</span>
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[#888888]">Contact Number:</span>
                  <span className="text-white font-semibold">{phone}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[#888888]">Booking Reference:</span>
                  <span className="font-mono text-[#00FF88] font-bold tracking-wider">{confirmedLeadId}</span>
                </div>
              </div>

              {/* Status Notice */}
              <div className="p-3.5 rounded-xl bg-[#14141d] border border-emerald-500/25 flex items-start gap-3 text-left w-full">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#8A8D93] leading-relaxed">
                  Your request is safely registered. Our official concierge will reach out to you directly on WhatsApp ({phone}) with pass delivery details and entry verification.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="w-full space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] hover:brightness-110 text-black font-heading font-black text-xs sm:text-sm tracking-[0.14em] uppercase transition-all shadow-[0_0_25px_rgba(0, 229, 255, 0.35)] cursor-pointer"
                >
                  DONE / CONTINUE BROWSING
                </button>

                {whatsappDirectUrl && (
                  <div className="text-center pt-1">
                    <a
                      href={whatsappDirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-mono text-[#888888] hover:text-[#25D366] transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>Need instant priority VIP clearance? Chat on WhatsApp</span>
                      <span>&rarr;</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ============================================================ */
            /* PASS SELECTION & CONTACT FORM                                */
            /* ============================================================ */
            <form onSubmit={handleSubmit} className="space-y-6">
              {formError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                  {formError}
                </div>
              )}

              {/* 1. Pass Tier Selection */}
              <div>
                <label className="text-[10px] font-mono tracking-widest text-[#00B4D8] uppercase block mb-3 font-semibold">
                  SELECT PASS CATEGORY
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      name: "General Admission",
                      sub: "Ground pitch entry",
                      mult: 1,
                      badge: "STANDARD",
                    },
                    {
                      name: "VIP Elevated Lounge",
                      sub: "Raised deck + bar access",
                      mult: 2.2,
                      badge: "POPULAR",
                    },
                    {
                      name: "Front Stage Fan Pit",
                      sub: "Immediate console access",
                      mult: 3.8,
                      badge: "EXCLUSIVE",
                    },
                  ].map((tier) => {
                    const isSelected = tierName === tier.name;
                    return (
                      <button
                        type="button"
                        key={tier.name}
                        onClick={() => {
                          setTierMultiplier(tier.mult);
                          setTierName(tier.name);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all relative ${
                          isSelected
                            ? "bg-[#00E5FF]/15 border-[#00E5FF] shadow-[0_0_20px_rgba(0, 229, 255, 0.25)]"
                            : "bg-white/[0.02] border-white/10 hover:border-white/20"
                        }`}
                      >
                        <span className="text-[9px] font-mono tracking-wider text-[#888888] uppercase block mb-1">
                          {tier.badge}
                        </span>
                        <div className="text-xs font-bold text-white leading-tight">
                          {tier.name}
                        </div>
                        <div className="text-[10px] text-[#777777] mt-1 leading-snug">
                          {tier.sub}
                        </div>
                        {showPrice && (
                          <div className="text-xs font-mono text-[#00B4D8] font-bold mt-2">
                            ₹{Math.round(numericINR * (tier.mult === 1 ? 1 : tier.mult === 2.2 ? 2.4 : 4)).toLocaleString("en-IN")}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Number of Passes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-mono tracking-widest text-[#00B4D8] uppercase font-semibold">
                    NUMBER OF PASSES
                  </label>
                  <span className="text-xs font-mono text-white font-bold">{quantity} PASS{quantity > 1 ? "ES" : ""}</span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 4, 6, 8, 10].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setQuantity(num)}
                      className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                        quantity === num
                          ? "bg-[#00E5FF] text-black shadow-md"
                          : "bg-white/5 text-[#888888] hover:text-white border border-white/10"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Customer Contact Info */}
              <div className="space-y-3 pt-1">
                <label className="text-[10px] font-mono tracking-widest text-[#00B4D8] uppercase block font-semibold">
                  YOUR CONTACT DETAILS
                </label>

                {/* Name */}
                <div>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Full Name *"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-[#00E5FF] transition-colors"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#00B4D8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone / Mobile Number (e.g. +91 98765 43210) *"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-[#00E5FF] transition-colors"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address (for confirmation pass slip)"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-[#00E5FF] transition-colors"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-[#888888] absolute left-3.5 top-3" />
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Special VIP table request, backstage inquiry, or preferred seating (optional)..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-[#00E5FF] transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Price Calculation Summary */}
              {showPrice ? (
                <div className="p-4 rounded-xl bg-[#14141d] border border-[#00E5FF]/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#888888] uppercase block">
                      Estimated Pass Total ({quantity} Passes)
                    </span>
                    <span className="text-xs text-[#00B4D8]">
                      ₹{inrPerTicket.toLocaleString("en-IN")} / pass (${usdPerTicket})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-black font-mono text-white">
                      ₹{totalINR.toLocaleString("en-IN")}
                    </span>
                    <span className="block text-[11px] font-mono text-[#888888]">
                      approx ${totalUSD}.00 USD
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#14141d] border border-white/10 flex items-center justify-between">
                  <span className="text-xs font-mono text-[#AAAAAA] uppercase">
                    Pass Inventory Status
                  </span>
                  <span className="text-xs font-mono font-bold text-[#00B4D8] uppercase">
                    Pricing Confirmed Upon Inquiry
                  </span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] hover:brightness-110 text-black font-heading font-black text-xs sm:text-sm tracking-[0.16em] uppercase flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(0, 229, 255, 0.45)] transition-all disabled:opacity-50 cursor-pointer"
              >
                <span>{isSubmitting ? "REGISTERING REQUEST..." : "CONFIRM PASS RESERVATION"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-[#888888]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>100% Official Artist Reservation • Direct Concierge Verification</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
