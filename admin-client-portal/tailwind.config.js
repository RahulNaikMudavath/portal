/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        slate: {
          955: "#090d16", // Beautiful deep dark slate background color
        },
        background: "var(--background)",
        "sec-bg": "var(--secondary-background)",
        card: "var(--surface-card)",
        "card-hover": "var(--card-hover)",
        border: "var(--border)",
        primary: "var(--primary)",
        "primary-hover": "var(--primary-hover)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        info: "var(--info)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        placeholder: "var(--placeholder)",
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

