/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: {
          DEFAULT: '#0a1628',
          800: '#0f1f3d',
          700: '#152647',
          600: '#1c2f56',
        },
        ocean: {
          DEFAULT: '#00b4d8',
          light: '#48cae4',
          dark: '#0077b6',
        },
        gold: {
          DEFAULT: '#c9a227',
          light: '#d4af37',
          dark: '#a07d1c',
          pale:  '#f5e6b0',
        },
        brand: {
          teal:  '#1b6b7b',
          navy:  '#0a1628',
          cream: '#f8f6f0',
        },
      },
      fontFamily: {
        sans:   ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['"Noto Kufi Arabic"', '"Noto Sans Arabic"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
