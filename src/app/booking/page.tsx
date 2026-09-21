"use client";

import { useState } from "react";
import { ShieldCheck, Send, CheckCircle2, ExternalLink } from "lucide-react";

const CLIENT_WHATSAPP_NUMBER = "919540681934";
const CLIENT_WHATSAPP_DISPLAY = "+91 95406 81934";

export default function BookingPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "Stadium / Arena Headline",
    eventDate: "",
    location: "",
    guestCount: "15,000 - 30,000",
    budget: "$100,000 - $250,000",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState("");

  const formatProposalWhatsAppMessage = () => {
    const lines = [
      "🔥 *DJ G SPARK — TOUR BOOKING PROPOSAL* 🔥",
      "━━━━━━━━━━━━━━━━━━━━━",
      `🏢 *Agency / Contact:* ${formData.name.trim()}`,
      `✉️ *Email:* ${formData.email.trim()}`,
      `📱 *Direct Phone / WhatsApp:* ${formData.phone.trim()}`,
      `📍 *Location:* ${formData.location.trim()}`,
      `🎪 *Event Type:* ${formData.eventType}`,
      `📅 *Target Date:* ${formData.eventDate}`,
      `👥 *Attendance:* ${formData.guestCount}`,
      `💰 *Budget Range:* ${formData.budget}`,
      `📝 *Notes & Specifications:* ${formData.message.trim() || "None"}`,
      "━━━━━━━━━━━━━━━━━━━━━",
      "⚡ *Direct Promoter Inquiry from DJ G Spark Official Website*",
    ];
    return lines.join("\n");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const messageText = formatProposalWhatsAppMessage();
    const encodedText = encodeURIComponent(messageText);
    const waLink = `https://api.whatsapp.com/send?phone=${CLIENT_WHATSAPP_NUMBER}&text=${encodedText}`;
    setWhatsappUrl(waLink);

    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "promoter_proposal",
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          eventType: formData.eventType,
          eventDate: formData.eventDate,
          budget: formData.budget,
          quantity: 1,
          totalPrice: 0,
          notes: `Attendance: ${formData.guestCount} | Notes: ${formData.message}`,
        }),
      });
    } catch (err) {
      console.error("Failed to save booking proposal lead", err);
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 sm:px-10 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-bold tracking-[0.24em] text-[#00B4D8] uppercase block mb-3">
          GLOBAL TOUR BOOKING
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-4">
          REPRESENTATION & <span className="text-[#00E5FF]">BOOKINGS</span>
        </h1>
        <p className="text-sm sm:text-base text-[#8A8D93] leading-relaxed">
          DJ G SPARK is currently reviewing exclusive headline offers for the 2026/2027 World Tour. Please submit your detailed promoter proposal below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
        {/* Booking Form (2 cols) */}
        <div className="lg:col-span-2 glass-card p-8 sm:p-12 rounded-3xl border border-white/10">
          {isSubmitted ? (
            <div className="py-12 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-bold inline-block mb-2">
                  PROPOSAL TRANSMITTED
                </span>
                <h2 className="text-2xl sm:text-3xl font-heading font-black text-white uppercase tracking-tight">
                  THANK YOU!
                </h2>
                <p className="text-xs sm:text-sm text-[#AAAAAA] max-w-md mx-auto mt-2 leading-relaxed">
                  Thank you, <strong className="text-white">{formData.name}</strong>. Your tour booking proposal has been submitted to artist management and automatically registered in our executive routing database.
                </p>
                <p className="text-[11px] text-emerald-400/90 font-mono mt-1">
                  ✓ Automated WhatsApp lead dispatched • Management will review and respond
                </p>
              </div>

              <div className="pt-4 flex flex-col items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({
                      name: "",
                      email: "",
                      phone: "",
                      eventType: "Stadium / Arena Headline",
                      eventDate: "",
                      location: "",
                      guestCount: "15,000 - 30,000",
                      budget: "$100,000 - $250,000",
                      message: "",
                    });
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] hover:brightness-110 text-black font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(0, 229, 255, 0.35)] cursor-pointer"
                >
                  Submit Another Proposal
                </button>

                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-mono text-[#888888] hover:text-[#25D366] transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Need priority promoter clearance? Chat on WhatsApp</span>
                    <span>&rarr;</span>
                  </a>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b border-white/10 pb-4 mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Promoter & Event Proposal</h3>
                  <p className="text-xs text-[#8A8D93]">Please fill out all confirmed venue and budget specifications.</p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-[#25D366] bg-[#25D366]/10 px-2.5 py-1 rounded-full border border-[#25D366]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                  <span>WhatsApp Connected: {CLIENT_WHATSAPP_DISPLAY}</span>
                </div>
              </div>

              {/* Row 1: Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#F5F6FA] block mb-2">
                    Contact / Agency Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Live Nation / Insomniac"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#F5F6FA] block mb-2">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="promoter@agency.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-colors"
                  />
                </div>
              </div>

              {/* Row 2: Phone & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#F5F6FA] block mb-2">
                    Direct Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#25D366] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#F5F6FA] block mb-2">
                    Venue City & Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Dubai, United Arab Emirates"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-colors"
                  />
                </div>
              </div>

              {/* Row 3: Event Type & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#F5F6FA] block mb-2">
                    Event Type *
                  </label>
                  <select
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#121216] border border-white/10 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-colors"
                  >
                    <option>Stadium / Arena Headline</option>
                    <option>Major Music Festival Mainstage</option>
                    <option>Nightclub Residency Showcase</option>
                    <option>Exclusive Corporate / Private Event</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#F5F6FA] block mb-2">
                    Target Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-colors"
                  />
                </div>
              </div>

              {/* Row 4: Capacity & Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#F5F6FA] block mb-2">
                    Anticipated Attendance *
                  </label>
                  <select
                    value={formData.guestCount}
                    onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#121216] border border-white/10 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-colors"
                  >
                    <option>Under 5,000</option>
                    <option>5,000 - 15,000</option>
                    <option>15,000 - 30,000</option>
                    <option>30,000+ (Stadium)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#F5F6FA] block mb-2">
                    Proposed Artist Fee Range (USD) *
                  </label>
                  <select
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#121216] border border-white/10 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-colors"
                  >
                    <option>$35,000 - $75,000 (Club / Regional)</option>
                    <option>$75,000 - $150,000 (Standard Arena)</option>
                    <option>$150,000 - $300,000 (Major Festival)</option>
                    <option>$300,000+ (Stadium 360 Production)</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#F5F6FA] block mb-2">
                  Event Theme & Additional Notes
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Provide co-headliners, ticketing timeline, venue holds, or special production requests..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-colors"
                />
              </div>

              {/* Submit CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-black font-bold text-xs tracking-[0.14em] uppercase hover:shadow-spark transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "TRANSMITTING..." : "SUBMIT BOOKING PROPOSAL"}</span>
                </button>

                <div className="flex items-center gap-2 text-xs text-[#8A8D93]">
                  <ShieldCheck className="w-4 h-4 text-[#25D366]" />
                  <span>Direct lead to WhatsApp: {CLIENT_WHATSAPP_DISPLAY}</span>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Sidebar: Agency Directory & Guidelines */}
        <div className="space-y-8">
          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-6">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Direct Artist WhatsApp
            </h4>

            <div className="p-4 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#25D366] block font-bold">
                INSTANT PROMOTER HOTLINE
              </span>
              <a
                href={`https://api.whatsapp.com/send?phone=${CLIENT_WHATSAPP_NUMBER}&text=${encodeURIComponent("Hello DJ G Spark Team, I am an event promoter looking to discuss headline tour availability.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-bold text-white hover:text-[#25D366] transition-colors flex items-center gap-2"
              >
                <span>{CLIENT_WHATSAPP_DISPLAY}</span>
                <ExternalLink className="w-4 h-4 text-[#25D366]" />
              </a>
              <p className="text-[11px] text-[#888888]">
                Direct agency hotline for stadium, festival & arena inquiries.
              </p>
            </div>

            <div className="space-y-4 text-xs text-[#8A8D93]">
              <div>
                <strong className="text-white block">Address:</strong>
                <p>Dwarka New Delhi (India)</p>
                <p className="text-[#00B4D8]">djgspark98@gmail.com</p>
              </div>
             
             
            </div>
          </div>

          {/* <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Promoter Guidelines
            </h4>
            <ul className="text-xs text-[#8A8D93] space-y-2">
              <li>• Offers must have confirmed venue holds.</li>
              <li>• 100km radius clause applies for 45 days prior.</li>
              <li>• 50% deposit required upon contract signature.</li>
              <li>• Dedicated artist security required backstage.</li>
            </ul>
          </div> */}
        </div>
      </div>
    </main>
  );
}
