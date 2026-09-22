"use client";

import { useState } from "react";
import { Mail, Disc, Users, Newspaper, Send, CheckCircle2, Phone, ExternalLink } from "lucide-react";

const CLIENT_WHATSAPP_NUMBER = "919540681934";
const CLIENT_WHATSAPP_DISPLAY = "+91 95406 81934";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSent, setIsSent] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const waMsg = [
      "⚡ *Dj G-Spark — DIRECT WEBSITE DISPATCH* ⚡",
      "━━━━━━━━━━━━━━━━━━━━━",
      `👤 *Name:* ${formData.name.trim()}`,
      `📱 *Phone / WhatsApp:* ${formData.phone.trim() || "Not specified"}`,
      `✉️ *Email:* ${formData.email.trim()}`,
      `📌 *Subject:* ${formData.subject.trim()}`,
      `💬 *Message:* ${formData.message.trim()}`,
      "━━━━━━━━━━━━━━━━━━━━━",
      "⚡ *Inquiry routed from Dj G-Spark.com contact portal*",
    ].join("\n");

    const waLink = `https://api.whatsapp.com/send?phone=${CLIENT_WHATSAPP_NUMBER}&text=${encodeURIComponent(waMsg)}`;
    setWhatsappUrl(waLink);

    // Automatically launch WhatsApp with prefilled contact inquiry
    if (typeof window !== "undefined") {
      window.open(waLink, "_blank");
    }

    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact_dispatch",
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          notes: `Subject: ${formData.subject.trim()} | Message: ${formData.message.trim()}`,
          quantity: 1,
          totalPrice: 0,
        }),
      });
    } catch (err) {
      console.error("Failed to save contact lead", err);
    } finally {
      setIsSubmitting(false);
      setIsSent(true);
    }
  };

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 sm:px-10 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-bold tracking-[0.24em] text-[#00B4D8] uppercase block mb-3">
          COMMUNICATIONS DIRECTORY
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-4">
          CONNECT WITH <span className="text-[#00E5FF]">THE SPARK</span>
        </h1>
        <p className="text-sm sm:text-base text-[#8A8D93] leading-relaxed">
          For management inquiries, press accreditation, music licensing, and VIP fan club support, reach out directly to the corresponding team.
        </p>
      </div>

      {/* Directory Grid */}
     

      {/* Quick Dispatch Form */}
      <div className="glass-card p-8 sm:p-12 rounded-3xl border border-white/10 max-w-2xl mx-auto">
        {/* <div className="text-center mb-8">
          <span className="text-xs font-bold tracking-[0.2em] text-[#00B4D8] uppercase block mb-2">
            DIRECT MESSAGE
          </span>
          <h2 className="text-2xl font-bold text-white">Send A Quick Dispatch</h2>
          <p className="text-xs text-[#888888] mt-1 font-mono">
            Directly routed to Artist Management
          </p>
        </div> */}

        {isSent ? (
          <div className="py-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-bold inline-block mb-2">
                MESSAGE DISPATCHED
              </span>
              <h3 className="text-2xl sm:text-3xl font-heading font-black text-white uppercase tracking-tight">
                THANK YOU!
              </h3>
              <p className="text-xs sm:text-sm text-[#AAAAAA] max-w-md mx-auto mt-2 leading-relaxed">
                Thank you, <strong className="text-white">{formData.name}</strong>! Your message has been received and automatically routed to our management team.
              </p>
              <p className="text-[11px] text-emerald-400/90 font-mono mt-1">
                ✓ WhatsApp lead generated • Management will respond shortly
              </p>
            </div>

            <div className="pt-2 flex flex-col items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsSent(false);
                  setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] hover:brightness-110 text-black font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(0, 229, 255, 0.35)] cursor-pointer"
              >
                Send Another Message
              </button>

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-mono text-[#888888] hover:text-[#25D366] transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Need instant urgent inquiry? Chat on WhatsApp</span>
                  <span>&rarr;</span>
                </a>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your Name *"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00E5FF]"
              />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Your Email *"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00E5FF]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Phone / WhatsApp (Optional)"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00E5FF]"
              />
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Subject (Press / Collab / Fan Inquiry) *"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00E5FF]"
              />
            </div>
            <textarea
              rows={4}
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Your Message..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00E5FF]"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-black font-bold text-xs tracking-[0.14em] uppercase hover:shadow-spark transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? "TRANSMITTING..." : "TRANSMIT DISPATCH & SEND TO WHATSAPP"}</span>
            </button>
          </form>
        )}
      </div>
    </main>
  );
}