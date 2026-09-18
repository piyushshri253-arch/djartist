import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': '#0B0C10',        // Deep Obsidian Black
        'bg-surface': '#1F2833',     // Charcoal Slate
        'bg-card': '#1F2833',        // Charcoal Slate
        'text-primary': '#F5F6FA',   // Platinum White
        'text-muted': '#8A8D93',     // Muted Silver Gray
        'brand-accent': '#00E5FF',   // Electric Neon Cyan
        'spark-cyan': '#00E5FF',     // Electric Neon Cyan
        'spark-amber': '#00E5FF',    // Electric Neon Cyan (primary CTA)
        'spark-orange': '#00B4D8',   // Deep Cyan / Electric Teal
        'spark-silver': '#8A8D93',   // Muted Silver Gray
        'spark-chrome': '#F5F6FA',   // Platinum White Chrome
        'spark-purple': '#00E5FF',   // Neon Cyan
      },
      fontFamily: {
        sans: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        'luxury': '0.12em',
        'wide-luxury': '0.18em',
      },
      boxShadow: {
        'spark': '0 0 25px rgba(0, 229, 255, 0.45)',
        'spark-lg': '0 0 50px rgba(0, 229, 255, 0.35)',
        'chrome': '0 0 25px rgba(245, 246, 250, 0.35)',
        'chrome-spark': '0 0 25px rgba(245, 246, 250, 0.3), 0 0 45px rgba(0, 229, 255, 0.4)',
        'ambient': '0 20px 50px rgba(11, 12, 16, 0.8)',
      }
    },
  },
  plugins: [],
} satisfies Config;