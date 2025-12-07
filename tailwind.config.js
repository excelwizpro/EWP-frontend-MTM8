/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"   // ← REQUIRED FOR Vercel BUILD
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2563eb",
          soft: "#dbeafe",
          dark: "#1d4ed8"
        }
      }
    }
  },
  plugins: []
};
