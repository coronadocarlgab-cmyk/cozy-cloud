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
          alert: "#FFE4E1",     // Soft Red/Pink for errors
        },
      },
      borderRadius: {
        '3xl': '2rem', // Super rounded corners
        '4xl': '3rem', // Extra rounded for modal/cards
      },
      boxShadow: {
        // The "Neumorphic" Soft Shadow
        'soft': '8px 8px 16px #d1d0aa, -8px -8px 16px #ffffff',
        // A deeper shadow for floating elements
        'float': '10px 10px 20px #d1d0aa, -10px -10px 20px #ffffff',
        // Inner shadow for "pressed" buttons or inputs
        'inner-soft': 'inset 4px 4px 8px #d1d0aa, inset -4px -4px 8px #ffffff',
      },
      animation: {
        'bounce-slight': 'bounce-slight 3s infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'pop-up': 'popUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
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
      }
    },
  },
  plugins: [],
};
export default config;