"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Authentication failed");
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

  const handleFillDemo = () => {
    setEmail("admin@djgspark.com");
    setPassword("SparkAdmin2026!");
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
            <div className="mb-5 p-3 sm:p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
              ⚠️ {errorMessage}
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
                  placeholder="admin@djgspark.com"
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
                  <span>ENTER DASHBOARD</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Preset Helper Pill */}
          <div className="mt-6 pt-6 border-t border-white/[0.08] text-center">
            <button
              type="button"
              onClick={handleFillDemo}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#00B4D8] hover:text-white transition-colors py-1 px-3 rounded-md bg-white/[0.03] border border-white/10"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fill Default Admin Credentials</span>
            </button>
            <span className="block text-[11px] text-[#666666] mt-2 font-mono">
              admin@djgspark.com • SparkAdmin2026!
            </span>
          </div>
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
