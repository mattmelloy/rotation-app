/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Primary: Terracotta - warm, appetizing
        primary: {
          50: '#fdf4f0',
          100: '#fae6dd',
          200: '#f5cbb8',
          300: '#eeaa8a',
          400: '#e5815a',
          500: '#d96b3f',
          600: '#c45c26',
          700: '#a34a1e',
          800: '#853d1d',
          900: '#6c341b',
          950: '#3a1a0d',
        },
        // Secondary: Sage Green - fresh, healthy
        secondary: {
          50: '#f4f7f4',
          100: '#e6ece6',
          200: '#cdd9cd',
          300: '#a8c0a8',
          400: '#7da37d',
          500: '#6b8e6b',
          600: '#547254',
          700: '#445b44',
          800: '#394a39',
          900: '#303d30',
          950: '#192019',
        },
        // Accent: Golden Amber - highlights
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#f5a623',
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#652a0a',
          950: '#422006',
        },
        // Semantic colors mapped to CSS variables
        base: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        border: 'var(--border-color)',
        'border-hover': 'var(--border-hover)',
        // Keep brand for backwards compatibility (mapped to primary)
        brand: {
          50: '#fdf4f0',
          100: '#fae6dd',
          200: '#f5cbb8',
          300: '#eeaa8a',
          400: '#e5815a',
          500: '#d96b3f',
          600: '#c45c26',
          700: '#a34a1e',
          800: '#853d1d',
          900: '#6c341b',
          950: '#3a1a0d',
        }
      },
      textColor: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
      },
      backgroundColor: {
        base: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
      },
      borderColor: {
        DEFAULT: 'var(--border-color)',
        hover: 'var(--border-hover)',
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(217, 107, 63, 0.3)',
        'glow-accent': '0 0 20px rgba(245, 166, 35, 0.3)',
        'glow-secondary': '0 0 20px rgba(107, 142, 107, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
        'slide-down': 'slideDown 0.3s ease-out forwards',
        'scale-in': 'scaleIn 0.2s ease-out forwards',
        'bounce-subtle': 'bounceSubtle 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
