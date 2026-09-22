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
  title: "Dj G-Spark | Feel The Spark. Enter The Sound.",
  description:
    "Dj G-Spark\nWeddings | Corporates | Concerts\nOne of the best DJ from Delhi",
  alternates: {
    canonical: "https://www.djgspark.com",
  },
  openGraph: {
    title: "Dj G-Spark | Feel The Spark. Enter The Sound.",
    description:
      "Dj G-Spark\nWeddings | Corporates | Concerts\nOne of the best DJ from Delhi",
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
    title: "Dj G-Spark | Feel The Spark. Enter The Sound.",
    description:
      "Dj G-Spark\nWeddings | Corporates | Concerts\nOne of the best DJ from Delhi",
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