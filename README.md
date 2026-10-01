# DJ G SPARK — Official Artist & Tour Web Platform

Premium high-energy web platform and administrative control center for international DJ & Producer **DJ G Spark**. Built with **Next.js 15 (App Router)**, **Tailwind CSS**, **Lucide React**, **TypeScript**, and **Framer Motion**.

---

## ⚡ Key Features

- **High-Energy Landing Page**: Cinematic hero reel with sound toggle, upcoming stadium dates, past tour archives, 3D interactive stage visuals, VIP booking inquiry form, and dynamic fan reviews.
- **WhatsApp Concierge Integration**: Quick action booking contact.
- **Pabbly Webhook Integration**: Lead forms automatically push contact submissions, VIP table inquiries, and fan reviews directly to WhatsApp via Pabbly Connect.
- **Hardened Admin Control Center (`/admin`)**:
  - Secure credential-based authentication with timing-safe comparison, session cookies, and rate-limiting.
  - **Past Events Dashboard**: Full table & visual grid views, instant filtering by year/city, search, and deletion.
  - **Full-Page Event Editor**: Single-page editor for adding and editing events with input sanitization.
  - **Gallery & Video Management**: Add, preview, and delete media items with live site sync.
  - **Instagram Connect & Sandbox Fallback**: Real Meta Graph API OAuth connection + Token paste + Sandbox reel manager.
  - **Site Settings & Reviews Moderation**: Approve or dismiss fan reviews and adjust global metadata.

---

## 🚀 One-Click Vercel Deployment Guide

1. **Push Repository to GitHub**:
   - Repository: `https://github.com/piyushshri253-arch/djartist`
2. **Import to Vercel**:
   - Go to Vercel Dashboard.
   - Select **Import Git Repository** and choose your repository.
   - Framework Preset: **Next.js** (auto-detected).
   - Root Directory: `./` (leave default).
3. **Environment Variables**:
   In Vercel project settings (**Settings -> Environment Variables**), configure the following:

   | Variable | Description | Example / Required Format |
   | :--- | :--- | :--- |
   | `MONGODB_URI` | MongoDB Atlas Cloud Connection String | `mongodb+srv://<user>:<password>@cluster.mongodb.net/dj_g_spark` |
   | `ADMIN_EMAIL` | Administrator login email | `<your-admin-email>` |
   | `ADMIN_PASSWORD` | Administrator password (Strong) | `<your-strong-password>` |
   | `SESSION_SECRET` | 256-bit cryptographically secure secret | `<generate-using-openssl-rand-hex-32>` |
   | `WHATSAPP_WEBHOOK_URL` | Pabbly Webhook URL | `https://connect.pabbly.com/webhook-listener/...` |
   | `INSTAGRAM_CLIENT_ID` | Meta App Client ID | *(Optional for Instagram OAuth)* |
   | `INSTAGRAM_CLIENT_SECRET` | Meta App Secret | *(Optional for Instagram OAuth)* |

4. **Deploy**:
   - Click **Deploy**. Vercel will build and assign your production domain.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
# Set your secure credentials in .env.local

# Start development server
npm run dev

# Open in browser
http://localhost:3000
```

---

## 🛡️ License & Copyright
© 2026 DJ G Spark & Spark Records. All Rights Reserved.
