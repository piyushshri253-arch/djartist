import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | DJ G Spark",
  description: "Official Privacy Policy for DJ G Spark and Meta/Instagram Integration.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#0B0C10] text-[#F5F6FA] min-h-screen pt-28 pb-20 px-6 sm:px-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-[#00E5FF] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="border-b border-white/10 pb-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs uppercase">
            <Shield className="w-3.5 h-3.5" />
            <span>Official Policy &bull; Meta Compliant</span>
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-white uppercase tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs font-mono text-[#8A8D93]">
            Last Updated: September 19, 2026
          </p>
        </div>

        <div className="space-y-6 text-sm text-[#8A8D93] leading-relaxed font-sans">
          <section className="space-y-2">
            <h2 className="text-white font-bold font-heading uppercase text-base">
              1. Overview
            </h2>
            <p>
              DJ G Spark (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) respects your privacy. This Privacy Policy explains how we handle information collected through our website and our official Meta / Instagram integration.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-white font-bold font-heading uppercase text-base">
              2. Data Collected via Instagram API
            </h2>
            <p>
              When an authorized administrator connects an Instagram account through the official Meta / Instagram Login, we access:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-xs font-mono text-white/90">
              <li>Instagram Username and User ID</li>
              <li>Profile Picture URL</li>
              <li>Public Media &amp; Reels (captions, thumbnails, permalinks, publish dates)</li>
            </ul>
            <p className="text-xs">
              We <strong>never</strong> access your Instagram passwords, private direct messages, personal contacts, or financial details.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-white font-bold font-heading uppercase text-base">
              3. Purpose of Data Use
            </h2>
            <p>
              The accessed Instagram content is strictly used to showcase up to 4 selected festival aftermovies, concert reels, and artist performance clips on the official DJ G Spark website.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-white font-bold font-heading uppercase text-base">
              4. Data Security &amp; Encryption
            </h2>
            <p>
              All Meta API access tokens are encrypted at rest using industry-standard AES-256-GCM encryption. Tokens are never exposed to browser clients, frontend code, or public responses.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-white font-bold font-heading uppercase text-base">
              5. Data Deletion &amp; Account Disconnection
            </h2>
            <p>
              You can disconnect your Instagram account at any time via the Admin Panel by clicking &quot;Disconnect Instagram&quot;. Disconnecting immediately revokes all access tokens and permanently purges all cached media from our database. To request manual deletion of any data, contact us at <strong>management@djgspark.com</strong>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-white font-bold font-heading uppercase text-base">
              6. Contact Information
            </h2>
            <p>
              For any questions regarding this policy, reach out to our management team at <strong>management@djgspark.com</strong> or via phone at <strong>+91 95406 81934</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
