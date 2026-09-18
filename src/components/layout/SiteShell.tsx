"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AudioProvider } from "@/context/AudioContext";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    // Dedicated isolated shell for the Client Admin Portal & Admin Login
    return <>{children}</>;
  }

  // Public concert website shell with dark styling, header, and footer
  return (
    <div className="bg-[#0B0C10] text-[#F5F6FA] min-h-screen selection:bg-[#00E5FF] selection:text-[#0B0C10] flex flex-col font-sans">
      <AudioProvider>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </AudioProvider>
    </div>
  );
}
