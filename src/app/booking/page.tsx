"use client";

import { useState } from "react";
import { ShieldCheck, Send, CheckCircle2, MessageSquare, ExternalLink, Calendar, MapPin, User, Mail, Phone } from "lucide-react";

const CLIENT_WHATSAPP_NUMBER = "919540681934";
const CLIENT_WHATSAPP_DISPLAY = "+91 95406 81934";

export default function BookingPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    place: "",
    date: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState("");

  const formatProposalWhatsAppMessage = () => {
    const lines = [
      "🔥 *NEW Dj G-Spark BOOKING INQUIRY* 🔥",
      "━━━━━━━━━━━━━━━━━━━━━",
      `👤 *Full Name:* ${formData.name.trim()}`,
      `📱 *Phone / WhatsApp:* ${formData.phone.trim()}`,
      formData.email.trim() ? `✉️ *Email ID:* ${formData.email.trim()}` : "",
      `📍 *City:* ${formData.city.trim()}`,
      `🎪 *Place / Venue:* ${formData.place.trim()}`,
      `📅 *Date:* ${formData.date}`,
      formData.message.trim() ? `📝 *Message:* ${formData.message.trim()}` : "",
      "━━━━━━━━━━━━━━━━━━━━━",
      "⚡ *Direct Inquiry from Dj G-Spark Official Website*",
    ].filter(Boolean);
    return lines.join("\n");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const messageText = formatProposalWhatsAppMessage();
    const encodedText = encodeURIComponent(messageText);
    const waLink = `https://api.whatsapp.com/send?phone=${CLIENT_WHATSAPP_NUMBER}&text=${encodedText}`;
    setWhatsappUrl(waLink);

    // Instantly launch WhatsApp directly with all fields pre-filled
    if (typeof window !== "undefined") {
      window.open(waLink, "_blank");
    }

    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "booking_inquiry",
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          eventCity: formData.city,
          location: formData.place,
          eventDate: formData.date,
          notes: formData.message,
          quantity: 1,
          totalPrice: "On Request",
        }),
      });
    } catch (err) {
      console.error("Failed to save booking inquiry lead", err);
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
          OFFICIAL BOOKING &amp; INQUIRY
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-4 uppercase">
          BOOK <span className="text-[#00E5FF]">Dj G-Spark</span>
        </h1>
        <p className="text-sm sm:text-base text-[#8A8D93] leading-relaxed">
          Book Dj G-Spark for weddings, concerts, club nights, and private events. Fill in the details below for instant quotation and WhatsApp response.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
        {/* Booking Form (2 cols) */}
        <div className="lg:col-span-2 glass-card p-8 sm:p-12 rounded-3xl border border-white/10">
          {isSubmitted ? (
            <div className="py-12 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-bold inline-block mb-2">
                  INQUIRY TRANSMITTED
                </span>
                <h2 className="text-2xl sm:text-3xl font-heading font-black text-white uppercase tracking-tight">
                  THANK YOU, {formData.name.toUpperCase()}!
                </h2>
                <p className="text-xs sm:text-sm text-[#AAAAAA] max-w-md mx-auto mt-2 leading-relaxed">
                  Your booking details have been sent directly to Dj G-Spark's management team and recorded successfully.
                </p>
                <p className="text-xs text-emerald-400 font-mono mt-2">
                  ✓ Automated WhatsApp lead dispatched to {CLIENT_WHATSAPP_DISPLAY}
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(37,211,102,0.4)] flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4 fill-white" />
                    <span>CHAT ON WHATSAPP NOW</span>
                  </a>
                )}

                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({
                      name: "",
                      email: "",
                      phone: "",
                      city: "",
                      place: "",
                      date: "",
                      message: "",
                    });
                  }}
                  className="w-full sm:w-auto px-7 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Submit Another Inquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b border-white/10 pb-4 mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase">Event Booking Inquiry</h3>
                  <p className="text-xs text-[#8A8D93]">Fill out the 7 simple fields below for instant booking clearance.</p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-[#25D366] bg-[#25D366]/10 px-2.5 py-1 rounded-full border border-[#25D366]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                  <span>WhatsApp: {CLIENT_WHATSAPP_DISPLAY}</span>
                </div>
              </div>

              {/* 1. Full Name & 2. Email ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#F5F6FA] block mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#F5F6FA] block mb-2">
                    Email ID *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-colors"
                  />
                </div>
              </div>

              {/* 3. Phone No & 4. City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#F5F6FA] block mb-2">
                    Phone No / WhatsApp *
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
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Delhi / Gurgaon / Jaipur"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-colors"
                  />
                </div>
              </div>

              {/* 5. Place / Venue & 6. Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#F5F6FA] block mb-2">
                    Place / Venue *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.place}
                    onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                    placeholder="e.g. The Leela Palace / Farmhouse / Club"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#F5F6FA] block mb-2">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#121216] border border-white/10 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-colors"
                  />
                </div>
              </div>

              {/* 7. Message */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#F5F6FA] block mb-2">
                  Message / Special Requirements
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your event type (Wedding, Sangeet, Cocktail, Birthday, Concert) or any special requests..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-colors"
                />
              </div>

              {/* Submit CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-9 py-4 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-black font-black text-xs tracking-[0.14em] uppercase hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "TRANSMITTING..." : "SUBMIT & SEND LEAD"}</span>
                </button>

                <div className="flex items-center gap-2 text-xs text-[#8A8D93]">
                  <ShieldCheck className="w-4 h-4 text-[#25D366]" />
                  <span>Direct lead to WhatsApp: {CLIENT_WHATSAPP_DISPLAY}</span>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Sidebar: Direct Artist WhatsApp & Contact */}
        <div className="space-y-8">
          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-6">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Direct Artist WhatsApp
            </h4>

            <div className="p-4 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#25D366] block font-bold">
                INSTANT BOOKING HOTLINE
              </span>
              <a
                href={`https://api.whatsapp.com/send?phone=${CLIENT_WHATSAPP_NUMBER}&text=${encodeURIComponent("Hello Dj G-Spark Team, I would like to inquire about event booking availability.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-bold text-white hover:text-[#25D366] transition-colors flex items-center gap-2"
              >
                <span>{CLIENT_WHATSAPP_DISPLAY}</span>
                <ExternalLink className="w-4 h-4 text-[#25D366]" />
              </a>
              <p className="text-[11px] text-[#888888]">
                Direct hotline for weddings, club nights, concerts &amp; private party bookings.
              </p>
            </div>

            <div className="space-y-4 text-xs text-[#8A8D93]">
              <div>
                <strong className="text-white block">Location:</strong>
                <p>Dwarka, New Delhi (India)</p>
                <p className="text-[#00B4D8] mt-1">djgspark98@gmail.com</p>
              </div>
              <div className="pt-3 border-t border-white/10">
                <strong className="text-white block mb-1">Genres:</strong>
                <p>Bollywood, Punjabi, Commercial, Retro, EDM, Bollytech, Melodic Techno.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
