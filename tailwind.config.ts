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
          pink: "#FFD1DC",
          cream: "#FFFDD0",
          sage: "#B2AC88",
          text: "#5D5D5D",
          paper: "#FFFFFF",
          alert: "#FFE4E1",
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
        'float-sleep': 'floatSleep 3s ease-out infinite', // <--- NEW: Gentle sleep animation
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
        floatUp: {
          '0%': { transform: 'translateY(0) scale(0.5)', opacity: '0' },
          '10%': { opacity: '0.6' },
          '90%': { opacity: '0.6' },
          '100%': { transform: 'translateY(-120vh) scale(1)', opacity: '0' },
        },
        // <--- NEW KEYFRAME: Short float & fade
        floatSleep: {
          '0%': { transform: 'translateY(0) scale(0.8)', opacity: '0' },
          '20%': { opacity: '1' }, // Visible quickly
          '80%': { opacity: '1' }, // Stay visible
          '100%': { transform: 'translateY(-30px) scale(1.1)', opacity: '0' }, // Float up 30px & fade
        }
      }
    },
  },
  plugins: [],
};
export default config;