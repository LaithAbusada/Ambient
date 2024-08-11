/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        test: "linear-gradient(90deg,#0c9 0,#09f)",
      },
    },
  },
  plugins: [],
};
