/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    fontFamily: {
      rajdhani: ["rajdhani", "sans-serif"],
      "open-sans": ["open-sans", "sans-serif"],
      sans: ['"Open Sans"', ...defaultTheme.fontFamily.sans],
    },
    extend: {
      animation: {
        loading: "loading 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        loading: {
          "50%": {
            opacity: ".75",
          },
        },
      },
      fontSize: {
        xs: "10px",
      },
      spacing: {
        3: "15px",
        4: "20px",
        5: "30px",
      },
      borderRadius: {
        DEFAULT: "2px",
      },
      colors: {
        orange: {
          50: "#fef8ee",
          100: "#fef0d6",
          200: "#fbdcad",
          300: "#f8c279",
          400: "#f59e42",
          500: "#f17d15",
          600: "#e36713",
          700: "#bc4f12",
          800: "#963e16",
          900: "#793515",
          950: "#411909",
        },
        gold: {
          50: "#fff9eb",
          100: "#ffeec6",
          200: "#ffda88",
          300: "#ffc24a",
          400: "#ffaf30",
          500: "#f98507",
          600: "#dd5f02",
          700: "#b74006",
          800: "#94300c",
          900: "#7a280d",
          950: "#461302",
        },
        blue: {
          50: "#f5f7fa",
          100: "#ebeef3",
          200: "#d3dae4",
          300: "#abbbce",
          400: "#7e96b2",
          500: "#5e7a99",
          600: "#4a617f",
          700: "#3d4f67",
          800: "#354357",
          900: "#28313e",
          950: "#202631",
        },
        "steel-blue": {
          50: "#f3f8fb",
          100: "#e4edf5",
          200: "#cfe0ee",
          300: "#afcce1",
          400: "#88b0d2",
          500: "#6c96c5",
          600: "#537bb5",
          700: "#4e6da7",
          800: "#445b89",
          900: "#3a4d6e",
          950: "#273144",
        },
        gray: {
          50: "#b3b3b3",
          100: "#e9e9e9",
          200: "#d1d1d1",
          300: "#b0b0b0",
          400: "#888888",
          450: "#808080",
          500: "#6d6d6d",
          600: "#5d5d5d",
          700: "#4f4f4f",
          800: "#454545",
          850: "#313131",
          900: "#3e3e3e",
          950: "#262626",
        },
        "black-alt": "#242424",
        "nav-disabled": "#707070",
        teal: {
          200: "#B2EDF1",
          300: "#7adde6",
        },
        red: {
          850: "#852420",
        },
        yellow: {
          550: "#CBC34E",
        },
        green: {
          450: "#33B578",
        },
      },
    },
  },
  plugins: [],
};
