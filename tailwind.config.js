// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"], // keep dark mode support if you want
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb", // blue-600
          light: "#3b82f6", // blue-500
          dark: "#1e40af", // blue-800
        },
        secondary: {
          DEFAULT: "#9333ea", // purple-600
          light: "#a855f7", // purple-500
          dark: "#7e22ce", // purple-800
        },
        accent: {
          DEFAULT: "#f59e0b", // amber-500
          light: "#fbbf24", // amber-400
          dark: "#b45309", // amber-700
        },
        neutral: {
          light: "#f3f4f6", // gray-100
          DEFAULT: "#9ca3af", // gray-400
          dark: "#111827", // gray-900
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
