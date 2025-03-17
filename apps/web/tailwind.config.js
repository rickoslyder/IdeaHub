/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3B82F6",
          dark: "#2563EB",
          light: "#60A5FA",
        },
        // Map the Tailwind v3 gray colors to neutral in v4 for compatibility
        gray: {
          50: "neutral-50",
          100: "neutral-100",
          200: "neutral-200",
          300: "neutral-300",
          400: "neutral-400",
          500: "neutral-500",
          600: "neutral-600",
          700: "neutral-700",
          800: "neutral-800",
          900: "neutral-900",
        },
      },
    },
  },
  plugins: [],
};
