/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#050918',
          900: '#0A0F2E',
          800: '#0d1338',
          700: '#151e50',
          600: '#1c2a6e',
          500: '#243580',
        },
        cream: {
          DEFAULT: '#F5EDD6',
          50: '#FDFAF3',
          100: '#FAF4E5',
          200: '#F5EDD6',
          300: '#EDD9A8',
        },
        electric: {
          300: '#A5BFFF',
          400: '#7FA6FF',
          500: '#4F7FFF',
          600: '#2B5EEF',
          700: '#1A47C8',
        },
        primary: {
          50: '#EEF4FF',
          100: '#D9E8FF',
          200: '#B3CFFF',
          300: '#8DB5FF',
          400: '#7FA6FF',
          500: '#4F7FFF',
          600: '#2B5EEF',
          700: '#1A47C8',
          800: '#1234A1',
          900: '#0E277A',
        },
        accent: {
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
        },
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        'sm': '6px',
        'md': '8px',
        'lg': '10px',
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
        'full': '9999px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08)',
        'glass': '0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07)',
        'glass-hover': '0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)',
        'glow': '0 0 24px rgba(79,127,255,0.35)',
        'glow-sm': '0 0 12px rgba(79,127,255,0.25)',
        'inner-light': 'inset 0 1px 0 rgba(255,255,255,0.08)',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'shimmer': {
          '0%': { 'background-position': '-200% 0' },
          '100%': { 'background-position': '200% 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'pulse-glow': {
          '0%, 100%': { 'box-shadow': '0 0 8px rgba(79,127,255,0.3)' },
          '50%': { 'box-shadow': '0 0 24px rgba(79,127,255,0.6)' },
        },
      },
      animation: {
        'gradient-shift': 'gradient-shift 10s ease infinite',
        'fade-up': 'fade-up 0.4s ease forwards',
        'fade-in': 'fade-in 0.3s ease forwards',
        'shimmer': 'shimmer 1.6s infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      backgroundSize: {
        '400%': '400% 400%',
      },
    },
  },
  plugins: [],
}
