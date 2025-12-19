import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // Added this line just in case since your folder structure is flat
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
        },
      },
      borderRadius: {
        '3xl': '2rem', // Super rounded corners
      },
    },
  },
  plugins: [],
};
export default config;