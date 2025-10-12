import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(60px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "glow": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(var(--primary) / 0.3)" },
          "50%": { boxShadow: "0 0 30px hsl(var(--primary) / 0.5)" },
        },
        "fadeInSlideZoom": {
          "0%": { 
            opacity: "0", 
            transform: "translateY(40px) scale(1.8)",
            filter: "blur(8px)"
          },
          "50%": { 
            opacity: "0.8", 
            transform: "translateY(-8px) scale(1.1)",
            filter: "blur(2px)"
          },
          "70%": {
            opacity: "0.95",
            transform: "translateY(2px) scale(0.98)",
            filter: "blur(0px)"
          },
          "100%": { 
            opacity: "1", 
            transform: "translateY(0) scale(1)",
            filter: "blur(0px)"
          },
        },
        "fadeInSlideUp": {
          "0%": { 
            opacity: "0", 
            transform: "translateY(40px) scale(0.95)",
            filter: "blur(4px)"
          },
          "60%": {
            opacity: "0.9",
            transform: "translateY(-4px) scale(1.02)",
            filter: "blur(0px)"
          },
          "100%": { 
            opacity: "1", 
            transform: "translateY(0) scale(1)",
            filter: "blur(0px)"
          },
        },
        "fadeIn": {
          "0%": { 
            opacity: "0",
            filter: "blur(4px)"
          },
          "100%": { 
            opacity: "1",
            filter: "blur(0px)"
          },
        },
        "popIn": {
          "0%": {
            opacity: "0",
            transform: "scale(0.8) translateY(20px)",
            filter: "blur(6px)"
          },
          "50%": {
            opacity: "0.8",
            transform: "scale(1.05) translateY(-5px)",
            filter: "blur(1px)"
          },
          "100%": {
            opacity: "1",
            transform: "scale(1) translateY(0)",
            filter: "blur(0px)"
          },
        },
        "slideInFade": {
          "0%": {
            opacity: "0",
            transform: "translateX(-30px) scale(0.95)",
            filter: "blur(4px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0) scale(1)",
            filter: "blur(0px)"
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-up": "fade-up 0.3s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "slide-up": "slide-up 0.6s ease-out forwards",
        "glow": "glow 2s ease-in-out infinite",
        "fadeInSlideZoom": "fadeInSlideZoom 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "fadeInSlideUp": "fadeInSlideUp 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "fadeIn": "fadeIn 0.6s ease-out forwards",
        "popIn": "popIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "slideInFade": "slideInFade 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
