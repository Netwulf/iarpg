/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/**/*.{ts,tsx}',
    '../../apps/web/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base
        black: '#0A0A0A',
        white: '#FFFFFF',

        // Gray Scale
        gray: {
          900: '#1A1A1A',
          800: '#2A2A2A',
          700: '#3A3A3A',
          600: '#6A6A6A',
          500: '#8A8A8A',
          400: '#9A9A9A',
          300: '#AAAAAA',
          200: '#CACACA',
          100: '#EAEAEA',
        },

        // Brand Green (Neon accent)
        green: {
          neon: '#39FF14',
          dim: '#2DD10F',
          dark: '#1FA806',
        },

        // Functional Colors
        blue: '#3B82F6',
        red: '#EF4444',
        yellow: '#F59E0B',
      },

      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },

      fontSize: {
        // Display
        display: ['48px', { lineHeight: '56px', letterSpacing: '-0.02em' }],

        // Headings
        h1: ['32px', { lineHeight: '40px', letterSpacing: '-0.01em' }],
        h2: ['24px', { lineHeight: '32px', letterSpacing: '-0.01em' }],
        h3: ['20px', { lineHeight: '28px', letterSpacing: '0' }],
        h4: ['18px', { lineHeight: '26px', letterSpacing: '0' }],

        // Body
        body: ['15px', { lineHeight: '24px', letterSpacing: '0' }],
        small: ['13px', { lineHeight: '20px', letterSpacing: '0' }],
        xs: ['11px', { lineHeight: '16px', letterSpacing: '0.01em' }],
      },

      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
        20: '80px',
      },

      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
      },

      animation: {
        'spin-dice': 'spin-dice 0.2s ease-out',
        'pulse-green': 'pulse-green 0.3s ease-out 2',
        'fade-in': 'fade-in 0.2s ease-out',
      },

      keyframes: {
        'spin-dice': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'pulse-green': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
