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
          DEFAULT: 'rgb(var(--primary-rgb, 0 0 0 / 0) / <alpha-value>)', // Remove blue fallback
          foreground: '#ffffff',
        }
      },
      keyframes: {
        loading: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        dealFront: {
          '0%': { transform: 'translate(1rem, -0.75rem) rotate(2deg) scale(0.97)', opacity: '0.85' },
          '100%': { transform: 'translate(0, 0) rotate(0deg) scale(1)', opacity: '1' },
        },
        dealBack: {
          '0%': { transform: 'translate(0, 0) rotate(0deg) scale(1)', opacity: '1' },
          '100%': { transform: 'translate(1rem, -0.75rem) rotate(2deg) scale(0.97)', opacity: '0.9' },
        },
      },
      animation: {
        loading: 'loading 1.5s infinite ease-in-out',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-out': 'fadeOut 0.6s ease-out forwards',
        'card-front': 'dealFront 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
        'card-back': 'dealBack 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
      }
    },
  },
  plugins: [],
}
