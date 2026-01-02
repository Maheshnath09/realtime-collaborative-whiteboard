/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          600: "#2563EB",
        },
        secondary: {
          600: "#4ECDC4",
        },
        accent: {
          500: "#3B82F6",
        },
        neutral: {
          950: "#0a0a0a",
          900: "#1a1a1a",
          800: "#2a2a2a",
          700: "#3a3a3a",
          600: "#4a4a4a",
          500: "#6a6a6a",
          400: "#8a8a8a",
          300: "#aaa",
          200: "#d0d0d0",
          100: "#e8e8e8",
          50: "#f5f5f5",
        },
      },
      backgroundColor: {
        dark: "#1a1a1a",
      },
      textColor: {
        light: "#ffffff",
      },
    },
  },
  plugins: [],
};

