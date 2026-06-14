/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#ffffff",
        brand: {
          50: "#3a241b",
          100: "#533020",
          600: "#FF5F1F",
          700: "#e94f13",
        },
      },
    },
  },
  plugins: [],
};
