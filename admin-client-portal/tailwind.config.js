/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        light: {
          bg: "#ffffff",
          text: "#000000",
          border: "#e5e7eb",
          card: "#f9fafb",
        },
        dark: {
          bg: "#1f2937",
          text: "#f3f4f6",
          border: "#374151",
          card: "#111827",
        },
      },
    },
  },
  plugins: [],
}

