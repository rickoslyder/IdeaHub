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
