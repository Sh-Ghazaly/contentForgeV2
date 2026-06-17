/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts.jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        forge: {
          950: '#0A0D1A',
          900: '#0F1525',
          800: '#151E35',
          700: '#1D2A4A',
          600: '#253460',
          500: '#2E4080',
          accent: '#3B82F6',
          'accent-warm': '#F59E0B',
          'accent-teal': '#14B8A6',
          'accent-rose': '#F43F5E',
        }
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'slide-in': 'slideIn 0.4s ease forwards',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(24px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideIn: {
          from: { opacity: 0, transform: 'translateX(-16px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        }
      }
    },
  },
  plugins: [],
}
