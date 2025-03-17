/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: [
    // Text colors
    "text-neutral-800",
    "text-neutral-700",
    "text-neutral-600",
    "text-neutral-500",
    "text-neutral-400",
    "text-neutral-300",
    "text-neutral-200",
    "text-neutral-100",
    "text-neutral-50",
    // Background colors
    "bg-neutral-800",
    "bg-neutral-700",
    "bg-neutral-600",
    "bg-neutral-500",
    "bg-neutral-400",
    "bg-neutral-300",
    "bg-neutral-200",
    "bg-neutral-100",
    "bg-neutral-50",
    // Text utilities
    "font-semibold",
    "font-medium",
    "antialiased",
    // Spacing and layout
    "px-4",
    "py-2",
    "rounded",
    "transition-colors",
    // Button classes
    "bg-primary",
    "text-white",
    "hover:bg-primary-dark",
    "hover:bg-neutral-300",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3B82F6",
          dark: "#2563EB",
          light: "#60A5FA",
        },
        neutral: {
          50: "rgb(250 250 250)",
          100: "rgb(245 245 245)",
          200: "rgb(229 229 229)",
          300: "rgb(212 212 212)",
          400: "rgb(163 163 163)",
          500: "rgb(115 115 115)",
          600: "rgb(82 82 82)",
          700: "rgb(64 64 64)",
          800: "rgb(38 38 38)",
          900: "rgb(23 23 23)",
        },
      },
    },
  },
  plugins: [],
};
