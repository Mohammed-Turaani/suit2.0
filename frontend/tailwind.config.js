/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: { brand: "#1a65a8" },
      boxShadow: { soft: "0 10px 30px rgba(0,0,0,0.10)" },
    },
  },
  plugins: [],
};
