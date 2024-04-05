/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          50: '#fef8ee',
          100: '#fef0d6',
          200: '#fbdcad',
          300: '#f8c279',
          400: '#f59e42',
          500: '#f17d15',
          600: '#e36713',
          700: '#bc4f12',
          800: '#963e16',
          900: '#793515',
          950: '#411909',  
        },
        gold: {
          50: '#fff9eb',
          100: '#ffeec6',
          200: '#ffda88',
          300: '#ffc24a',
          400: '#ffaf30',
          500: '#f98507',
          600: '#dd5f02',
          700: '#b74006',
          800: '#94300c',
          900: '#7a280d',
          950: '#461302',
        }
      }
    },
  },
  plugins: [],
}

