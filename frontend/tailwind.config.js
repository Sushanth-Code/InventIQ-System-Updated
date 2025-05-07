/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: "#1E88E5",
          secondary: "#43A047",
          warning: "#FB8C00",
          danger: "#E53935",
          dark: "#263238",
          light: "#ECEFF1"
        }
      },
    },
    plugins: [],
  }