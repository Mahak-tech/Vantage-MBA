/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sakura: {
          bg: '#FFF8F3',
          sub: '#F8F0FA',
          pink: '#F6C6D3',
          'pink-dark': '#E89CB0',
          lavender: '#CDB8F5',
          'lavender-dark': '#A584E8',
          mint: '#BFE5D4',
          'mint-dark': '#8BC9B0',
          yellow: '#F9E8AD',
          'yellow-dark': '#E5CA68',
          text: '#463951',
          muted: '#85778F',
          card: '#FFFFFF',
          border: '#F3E9F1',
        },
        brand: {
          50: '#fdf8fa',
          100: '#fbeff4',
          200: '#f6d9e4',
          300: '#f0b7cb',
          400: '#e58da9',
          500: '#cdb8f5',
          600: '#b291ed',
          700: '#9465e3',
          800: '#7540cc',
          900: '#463951',
          950: '#2a1f33',
        },
      },
      boxShadow: {
        'sakura-sm': '0 2px 8px -2px rgba(70, 57, 81, 0.05), 0 1px 4px -1px rgba(246, 198, 211, 0.15)',
        'sakura': '0 8px 24px -4px rgba(70, 57, 81, 0.06), 0 2px 8px -2px rgba(205, 184, 245, 0.2)',
        'sakura-lg': '0 16px 36px -6px rgba(70, 57, 81, 0.08), 0 4px 16px -2px rgba(246, 198, 211, 0.25)',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      keyframes: {
        'gentle-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'sakura-fall': {
          '0%': { transform: 'translateY(-10px) rotate(0deg)', opacity: '0.9' },
          '100%': { transform: 'translateY(120px) rotate(180deg)', opacity: '0' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        }
      },
      animation: {
        'gentle-float': 'gentle-float 4s ease-in-out infinite',
        'sakura-fall': 'sakura-fall 6s linear infinite',
        'pulse-subtle': 'pulse-subtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}