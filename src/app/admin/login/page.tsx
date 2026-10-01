"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, KeyRound } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          mfaCode: mfaCode.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.mfaRequired) {
          setMfaRequired(true);
          setErrorMessage("Two-Factor Authentication (2FA/MFA) code required. Enter your 6-digit authenticator code.");
        } else {
          setErrorMessage(data.error || "Authentication failed");
        }
        setIsLoading(false);
        return;
      }

      // Successfully authenticated
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setErrorMessage("Network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#F5F6FA] flex items-center justify-center p-4 sm:p-6 py-6 sm:py-10 relative overflow-hidden selection:bg-[#00E5FF] selection:text-black">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00E5FF]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-[#00E5FF]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Top Brand Pill */}
        <div className="text-center mb-5 sm:mb-8">
          <Link href="/" className="inline-block group mb-4">
            <img
              src="/images/DJ-G-SPARK-Light.png"
              alt="Dj G-Spark"
              className="h-16 sm:h-20 md:h-24 w-auto mx-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_28px_rgba(255,255,255,0.45)] hover:drop-shadow-[0_0_35px_rgba(0, 229, 255, 0.6)]"
            />
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[10px] font-mono tracking-[0.22em] text-[#00B4D8] uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>CLIENT ADMIN PORTAL</span>
          </div>
          <h1 className="font-heading font-bold text-xl sm:text-2xl uppercase mt-3 text-white">
            Artist Management Login
          </h1>
          <p className="text-xs text-[#888888] font-sans mt-1">
            Executive access for concert tours, pass reservations, real Instagram sync, and fan reviews.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0c0c12] border border-white/10 rounded-2xl p-5 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          {errorMessage && (
            <div className={`mb-5 p-3 sm:p-4 rounded-xl text-xs font-mono border ${
              mfaRequired ? "bg-amber-500/10 border-amber-500/30 text-amber-300" : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}>
              {mfaRequired ? "🛡️ " : "⚠️ "} {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-mono tracking-wider text-[#A0A0A0] uppercase mb-2">
                Admin Email / Username
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-[#14141c] border border-white/10 rounded-lg px-4 py-3 pl-10 text-sm text-white focus:outline-none focus:border-[#00E5FF] transition-colors placeholder:text-neutral-600 font-sans"
                />
                <Mail className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-mono tracking-wider text-[#A0A0A0] uppercase mb-2">
                Secure Key / Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#14141c] border border-white/10 rounded-lg px-4 py-3 pl-10 pr-10 text-sm text-white focus:outline-none focus:border-[#00E5FF] transition-colors placeholder:text-neutral-600 font-sans"
                />
                <Lock className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#666666] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* MFA / 2FA Code Field (shown when MFA is active or requested) */}
            {mfaRequired && (
              <div className="animate-in fade-in duration-300">
                <label className="block text-xs font-mono tracking-wider text-[#00E5FF] uppercase mb-2 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>2FA Authenticator Code (6-Digits)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    required
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="123456"
                    className="w-full bg-[#14141c] border-2 border-[#00E5FF]/60 rounded-lg px-4 py-3 pl-10 text-lg tracking-[0.4em] font-mono text-center text-[#00E5FF] focus:outline-none focus:border-[#00E5FF] transition-colors placeholder:text-neutral-700"
                  />
                  <KeyRound className="w-4 h-4 text-[#00E5FF] absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-lg bg-[#00E5FF] hover:bg-white text-black font-heading font-bold text-xs tracking-[0.2em] uppercase transition-all shadow-[0_0_25px_rgba(0, 229, 255, 0.4)] flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>VERIFYING CREDENTIALS...</span>
              ) : (
                <>
                  <span>{mfaRequired ? "VERIFY 2FA & ENTER" : "ENTER DASHBOARD"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs font-mono text-[#777777] hover:text-[#00E5FF] transition-colors uppercase tracking-widest"
          >
            ← Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}
