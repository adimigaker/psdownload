/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#e50914",
          hover: "#f40612",
        },
        dark: {
          bg: "#0a0a0f",
          surface: "#12121a",
          card: "#16161f",
          border: "#2a2a3a",
        },
        text: {
          primary: "#ffffff",
          secondary: "#b3b3b3",
          muted: "#888888",
        },
        gold: "#f1c40f",
      },
      fontFamily: {
        heading: ["Bebas Neue", "sans-serif"],
        sans: ["DM Sans", "sans-serif"],
      },
      animation: {
        "spin-slow": "spin 1s linear infinite",
      },
    },
  },
  plugins: [],
};