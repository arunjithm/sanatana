/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cosmic: {
          bg: '#050510',
          deep: '#0a0a1a',
          node: '#7c3aed',
          link: '#4f46e5',
          highlight: '#f59e0b',
          text: '#e2e8f0',
          muted: '#64748b',
        },
      },
      fontFamily: {
        devanagari: ['"Noto Serif Devanagari"', '"Noto Serif"', 'serif'],
      },
    },
  },
  plugins: [],
};
