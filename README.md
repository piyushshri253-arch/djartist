# DJ G SPARK — Official Artist & Tour Web Platform

Premium high-energy web platform and administrative control center for international DJ & Producer **DJ G Spark**. Built with **Next.js 15 (App Router)**, **Tailwind CSS**, **Lucide React**, **TypeScript**, and **Framer Motion**.

---

## ⚡ Key Features

- **High-Energy Landing Page**: Cinematic hero reel with sound toggle, upcoming stadium dates, past tour archives, 3D interactive stage visuals, VIP booking inquiry form, and dynamic fan reviews.
- **Floating WhatsApp Quick Action**: Persistent radar-pulse WhatsApp beacon (`+91 95406 81934`) with dismissible VIP Concierge tooltip.
- **Pabbly Webhook Integration**: Lead forms automatically push contact submissions, VIP table inquiries, and fan reviews directly to WhatsApp via Pabbly Connect.
- **Dedicated Admin Control Center (`/admin`)**:
  - Secure credential-based authentication with session cookies.
  - **Past Events Dashboard**: Full table & visual grid views, instant filtering by year/city, search, and deletion.
  - **Full-Page Event Editor**: Single-page editor for adding and editing events without popup modals.
  - **Gallery & Video Management**: Add, preview, and delete media items with live site sync.
  - **Instagram Connect & Sandbox Fallback**: Real Meta Graph API OAuth connection + Token paste + Sandbox reel manager.
  - **Site Settings & Reviews Moderation**: Approve or dismiss fan reviews and adjust global metadata.

---

## 🚀 One-Click Vercel Deployment Guide

1. **Push Repository to GitHub**:
   - Repository: `https://github.com/piyushshri253-arch/djartist`
2. **Import to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/new).
   - Select **Import Git Repository** and choose `piyushshri253-arch/djartist`.
   - Framework Preset: **Next.js** (auto-detected).
   - Root Directory: `./` (leave default).
3. **Environment Variables**:
   In Vercel project settings, configure the following variables (or use default fallbacks):

   | Variable | Description | Default / Example |
   | :--- | :--- | :--- |
   | `ADMIN_EMAIL` | Admin login email | `admin@djgspark.com` |
   | `ADMIN_PASSWORD` | Admin password | `SparkAdmin2026!` |
   | `SESSION_SECRET` | Cookie encryption key | *Any strong 32-char string* |
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

# Start development server
npm run dev

# Open in browser
http://localhost:3000
```

---

## 🔐 Default Admin Credentials

- **URL**: `http://localhost:3000/admin` (or `https://your-domain.vercel.app/admin`)
- **Email**: `admin@djgspark.com`
- **Password**: `SparkAdmin2026!`

---

## 🛡️ License & Copyright
© 2026 DJ G Spark & Spark Records. All Rights Reserved.
