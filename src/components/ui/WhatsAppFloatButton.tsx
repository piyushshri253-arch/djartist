"use client";

import { useState } from "react";
import { WhatsAppIcon } from "@/components/ui/SocialIcons";
import { X } from "lucide-react";

interface WhatsAppFloatButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export function WhatsAppFloatButton({
  phoneNumber = "919540681934",
  defaultMessage = "Hi Dj G-spark Team, I am visiting your official website and would like to inquire about concert passes and event booking.",
}: WhatsAppFloatButtonProps) {
  const [showTooltip, setShowTooltip] = useState(true);

  const encodedMessage = encodeURIComponent(defaultMessage);
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;

  return (
    <aside
      aria-label="WhatsApp Support and Concierge"
      className="fixed bottom-6 right-6 z-[95] flex flex-col items-end gap-2 pointer-events-auto select-none"
    >
      {/* Floating Tooltip / Banner (dismissible) */}
      {showTooltip && (
        <div className="relative group bg-[#1F2833] border border-[#25D366]/40 text-white rounded-2xl p-3.5 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(37,211,102,0.15)] max-w-xs animate-in fade-in slide-in-from-bottom-3 duration-300 backdrop-blur-md">
          {/* Close button for tooltip */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-[#1e1e26] border border-white/20 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
            title="Dismiss"
          >
            <X className="w-3 h-3" />
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 cursor-pointer"
          >
            <div className="relative shrink-0 mt-0.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#25D366] to-[#128C7E] flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,211,102,0.35)]">
                <WhatsAppIcon className="w-5 h-5 fill-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#00FF88] border-2 border-[#1F2833] animate-pulse" />
            </div>

            <div className="min-w-0 pr-1">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                <span className="text-[10px] text-[#25D366] font-mono font-bold uppercase tracking-wider">ONLINE</span>
              </div>
              <p className="text-xs font-bold text-white leading-snug">
                Check availability or book now
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                Chat with our official team directly on WhatsApp.
              </p>
            </div>
          </a>
        </div>
      )}

      {/* Main Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Dj G-spark Team on WhatsApp"
        className="group relative flex items-center gap-3 p-3 sm:px-4 sm:py-3.5 rounded-full bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white shadow-[0_10px_30px_rgba(37,211,102,0.35),0_0_20px_rgba(37,211,102,0.25)] hover:shadow-[0_15px_40px_rgba(37,211,102,0.5),0_0_30px_rgba(37,211,102,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
      >
        {/* Subtle Outer Radar Pulse */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 animate-ping pointer-events-none" />

        {/* WhatsApp Icon */}
        <div className="relative z-10 w-6 h-6 flex items-center justify-center shrink-0">
          <WhatsAppIcon className="w-6 h-6 fill-white" />
        </div>

        {/* Text Label for Desktop (Collapses neatly on small screens) */}
        <div className="hidden sm:flex flex-col text-left leading-none pr-1">
          <span className="text-[10px] font-mono tracking-widest text-black/80 font-extrabold uppercase">
            QUICK CHAT
          </span>
          <span className="text-xs font-black tracking-wide text-white uppercase mt-0.5">
            WhatsApp
          </span>
        </div>
      </a>
    </aside>
  );
}
