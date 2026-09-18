import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SiteShell } from "@/components/layout/SiteShell";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "DJ G SPARK | Feel The Spark. Enter The Sound.",
  description:
    "Official 3D virtual concert tour and platform for international electronic music artist DJ G SPARK. High-octane arena tour, original releases, and live tour dates.",
  icons: {
    icon: "/images/DJ-G-SPARK-Light.png",
    apple: "/images/DJ-G-SPARK-Light.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} font-sans antialiased`}>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}