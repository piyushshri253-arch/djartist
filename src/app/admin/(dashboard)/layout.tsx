import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/lib/auth";
import Link from "next/link";
import { ExternalLink, LogOut, MessageSquare, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-amber-500 selection:text-white">
      {/* Top Executive Command Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs px-4 sm:px-8 py-3">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          {/* Left: Brand Identity & Portal Tag */}
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="bg-slate-950 p-1.5 px-2 rounded-xl flex items-center justify-center shadow-xs border border-slate-800">
                <img
                  src="/images/DJ-G-SPARK-Light.png"
                  alt="Dj G-spark"
                  className="h-7 sm:h-8 w-auto object-contain"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black tracking-tight text-slate-900 leading-tight">
                    Dj G-spark
                  </span>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-slate-900 text-amber-400 text-[10px] font-bold font-mono tracking-wider uppercase">
                    Client Portal
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  Artist & Concert Management System
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] text-emerald-800 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Production Live • All Systems Operational</span>
            </div>
          </div>

          {/* Right: Direct Actions & User Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* WhatsApp Leads Direct Shortcut */}
            <a
              href="https://api.whatsapp.com/send?phone=919540681934"
              target="_blank"
              rel="noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold text-emerald-700 transition-colors"
              title="Official Lead Dispatch Number"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp: +91 95406 81934</span>
            </a>

            {/* View Live Website Button */}
            <Link
              href="/"
              target="_blank"
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <span>View Live Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </Link>

            {/* Profile Info Card */}
            <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-950 text-amber-400 font-bold text-xs flex items-center justify-center shadow-xs border border-slate-800">
                {admin.name?.charAt(0) || "A"}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  {admin.name}
                </span>
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60 w-fit">
                  {admin.role}
                </span>
              </div>
            </div>

            {/* Logout Action */}
            <form action="/api/admin/auth/logout" method="POST">
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-semibold text-rose-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Sign out of Client Admin Panel"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main SaaS Workspace Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-8 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
