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
        'bg-base': '#050505',
        'bg-surface': '#0B0B0E',
        'bg-card': '#0E0E14',
        'text-primary': '#FFFFFF',
        'text-muted': '#A1A1AA',
        'spark-amber': '#FF6A00',
        'spark-orange': '#FF7A00',
        'spark-silver': '#E2E8F0',
        'spark-chrome': '#CBD5E1',
        'spark-purple': '#7A4CFF',
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
        'spark': '0 0 25px rgba(255, 106, 0, 0.45)',
        'spark-lg': '0 0 50px rgba(255, 106, 0, 0.35)',
        'chrome': '0 0 25px rgba(255, 255, 255, 0.35)',
        'chrome-spark': '0 0 25px rgba(255, 255, 255, 0.3), 0 0 45px rgba(255, 106, 0, 0.35)',
        'ambient': '0 20px 50px rgba(0, 0, 0, 0.8)',
      }
    },
  },
  plugins: [],
} satisfies Config;