import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Organic eco theme
        eco: {
          green: "hsl(var(--eco-green))",
          emerald: "hsl(var(--eco-emerald))",
          teal: "hsl(var(--eco-teal))",
          sky: "hsl(var(--eco-sky))",
          amber: "hsl(var(--eco-amber))",
          orange: "hsl(var(--eco-orange))",
          rose: "hsl(var(--eco-rose))",
          purple: "hsl(var(--eco-purple))",
          indigo: "hsl(var(--eco-indigo))",
        },
        // Module colors
        citizen: "hsl(var(--citizen-primary))",
        worker: "hsl(var(--worker-primary))",
        ngo: "hsl(var(--ngo-primary))",
        scrap: "hsl(var(--scrap-primary))",
        admin: "hsl(var(--admin-primary))",
        // Status colors
        status: {
          success: "hsl(var(--status-success))",
          warning: "hsl(var(--status-warning))",
          error: "hsl(var(--status-error))",
          info: "hsl(var(--status-info))",
          pending: "hsl(var(--status-pending))",
        },
        // Score colors
        score: {
          gold: "hsl(var(--score-gold))",
          silver: "hsl(var(--score-silver))",
          bronze: "hsl(var(--score-bronze))",
          platinum: "hsl(var(--score-platinum))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Direct organic palette access
        moss: "#5D7052",
        clay: "#C18C5D",
        sand: "#E6DCCD",
        bark: "#4A4A40",
        stone: "#F0EBE5",
        loam: "#2C2C24",
        timber: "#DED8CF",
        "rice-paper": "#FDFCF8",
        "burnt-sienna": "#A85448",
      },
      backgroundImage: {
        'gradient-eco': 'var(--gradient-eco)',
        'gradient-ocean': 'var(--gradient-ocean)',
        'gradient-sunset': 'var(--gradient-sunset)',
        'gradient-royal': 'var(--gradient-royal)',
        'gradient-golden': 'var(--gradient-golden)',
        'gradient-nature': 'var(--gradient-nature)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'card': 'var(--shadow-card)',
        'hover': 'var(--shadow-hover)',
        'glow': 'var(--shadow-glow)',
        'soft': '0 4px 20px -2px rgba(93, 112, 82, 0.15)',
        'float': '0 10px 40px -10px rgba(193, 140, 93, 0.2)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        'organic': '2rem',
        'organic-lg': '3rem',
        'pill': '9999px',
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        "bounce-gentle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "bounce-gentle": "bounce-gentle 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
