/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'trend-green': {
          50: '#f0f7f0',
          100: '#dce8dc',
          200: '#b9d1b9',
          300: '#8fb48f',
          400: '#659765',
          500: '#4a7a4a',
          600: '#3a5f3a',
          700: '#2a442a',
          800: '#1a2e1a',
          900: '#0a1a0a',
        },
        gold: {
          50: '#fdf6e6',
          100: '#fae8c4',
          200: '#f5d09e',
          300: '#efb878',
          400: '#eaa052',
          500: '#e4882c',
          600: '#c9701a',
          700: '#a55813',
          800: '#82400d',
          900: '#5f2e07',
        },
      },
    },
  },
  plugins: [],
          }
