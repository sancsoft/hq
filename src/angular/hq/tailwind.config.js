/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        transparent: "transparent",
        current: "currentColor",
        orange: "#F17D15",
        "lt-blue": "#537BB5",
        "dk-blue": "#28313E",
        accent: "#B2EDF1",
        black: "#000",
        white: "#fff",
        green: "#33B578",
        red: "#852420",
        yellow: "#CBC34E",
        gray: {
          100: "#E9E9E9",
          200: "#B3B3B3",
          300: "#707070",
          400: "#3E3E3E",
          500: "#313131",
          600: "#242424",
        },
      },
      fontFamily: {
        sans: ['"Open Sans"', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
