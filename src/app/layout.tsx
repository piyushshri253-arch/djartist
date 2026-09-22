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
  metadataBase: new URL("https://www.djgspark.com"),
  title: "Dj G-Spark | Official Website | One of The Best DJ From Delhi (India)",
  description:
    "Official website of Dj G-Spark (Gaurav Singh) — Top open-format DJ and music producer from Delhi (India). Explore upcoming shows, music releases, event gallery, and live bookings.",
  alternates: {
    canonical: "https://www.djgspark.com",
  },
  openGraph: {
    title: "Dj G-Spark | One of The Best DJ From Delhi (India)",
    description:
      "Official website of Dj G-Spark. Explore live tour dates, music releases, festival drops, and event booking.",
    url: "https://www.djgspark.com",
    siteName: "Dj G-Spark",
    images: [
      {
        url: "/images/DJ-G-SPARK-Light.png",
        width: 1200,
        height: 630,
        alt: "Dj G-Spark Official Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dj G-Spark | Official Website",
    description:
      "Official website of Dj G-Spark — Top open-format DJ and music producer from Delhi (India).",
    images: ["/images/DJ-G-SPARK-Light.png"],
  },
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