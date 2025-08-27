/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        felt: {
          50: '#f0fdf0',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        mahjong: {
          ivory: '#F4F0E6',
          blue: '#103C57',
          red: '#B02A2C',
          teal: '#0D4B57',
          navy: '#153A50',
          green: '#1E6E52',
          jade: '#2E6D5A',
        }
      },
      fontFamily: {
        'chinese': ['Noto Sans SC', 'SimSun', 'serif'],
      },
      animation: {
        'tile-hover': 'tileHover 0.2s ease-in-out',
        'tile-select': 'tileSelect 0.15s ease-in-out',
      },
      keyframes: {
        tileHover: {
          '0%': { transform: 'translateY(0) scale(1)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
          '100%': { transform: 'translateY(-2px) scale(1.02)', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }
        },
        tileSelect: {
          '0%': { transform: 'translateY(0)', backgroundColor: 'rgba(255,255,255,1)' },
          '100%': { transform: 'translateY(-4px)', backgroundColor: 'rgba(59, 130, 246, 0.1)' }
        }
      }
    },
  },
  plugins: [],
}