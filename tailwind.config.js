/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f0f12',
        surface: '#17171c',
        surface2: '#1f1f27',
        border: '#2a2a35',
        text: '#e8e8ee',
        muted: '#9a9ab0',
        accent: '#7c5cff',
        accent2: '#4cc9f0',
        success: '#4ade80',
        warning: '#fbbf24',
        error: '#f87171',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}