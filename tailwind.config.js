/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0ea5e9",
        income: "#10b981",
        expense: "#dc2626",
        profit: "#0ea5e9",
      },
      fontFamily: {
        display: ["Space Mono", "monospace"],
        sans: ["Space Grotesk", "system-ui", "sans-serif"],
      },
      keyframes: {
        slideInUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "slide-in-up": "slideInUp 0.4s ease-out",
        "fade-in": "fadeIn 0.3s ease-in",
      },
    },
  },
  plugins: [],
};
