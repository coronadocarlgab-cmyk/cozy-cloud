import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cozy: {
          pink: "#FFD1DC",      // Primary Pink
          cream: "#FFFDD0",     // Warm Background
          sage: "#B2AC88",      // Green Accents
          text: "#5D5D5D",      // Soft Grey Text
          paper: "#FFFFFF",     // White Cards
          alert: "#FFE4E1",     // Soft Red/Pink
        },
      },
      borderRadius: {
        '3xl': '2rem',
        '4xl': '3rem',
      },
      boxShadow: {
        'soft': '8px 8px 16px #d1d0aa, -8px -8px 16px #ffffff',
        'float': '10px 10px 20px #d1d0aa, -10px -10px 20px #ffffff',
        'inner-soft': 'inset 4px 4px 8px #d1d0aa, inset -4px -4px 8px #ffffff',
      },
      animation: {
        'bounce-slight': 'bounce-slight 3s infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'pop-up': 'popUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'float-up': 'floatUp 15s linear infinite',
      },
      keyframes: {
        'bounce-slight': {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        popUp: {
          '0%': { opacity: '0', transform: 'scale(0.9) translateY(20px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        // --- FIX IS HERE ---
        floatUp: {
          '0%': { transform: 'translateY(0) scale(0.5)', opacity: '0' }, // Start at bottom
          '10%': { opacity: '0.6' }, // Fade in
          '90%': { opacity: '0.6' }, // Stay visible
          '100%': { transform: 'translateY(-120vh) scale(1)', opacity: '0' }, // Float to TOP (negative Y)
        }
      }
    },
  },
  plugins: [],
};
export default config;