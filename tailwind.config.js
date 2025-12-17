/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--primary-rgb, 37 99 235) / <alpha-value>)', // Fallback to blue-600 (37 99 235)
          foreground: '#ffffff',
        }
      }
    },
  },
  plugins: [],
}
