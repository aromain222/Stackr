import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          base: '#080A0F',
          card: '#0E1018',
          elevated: '#141720',
          border: '#1C2030',
          hover: '#1A1E2C',
        },
        ink: {
          primary: '#F0F2F8',
          secondary: '#7C8599',
          muted: '#4A5166',
          inverse: '#080A0F',
        },
        brand: {
          DEFAULT: '#5B8BF5',
          dim: '#1A2A4A',
          glow: 'rgba(91, 139, 245, 0.15)',
        },
        success: {
          DEFAULT: '#00D4A0',
          dim: '#002A20',
        },
        warning: {
          DEFAULT: '#F5A623',
          dim: '#2A1A00',
        },
        danger: {
          DEFAULT: '#F56060',
          dim: '#2A0A0A',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        glow: '0 0 40px rgba(91, 139, 245, 0.12)',
        'glow-success': '0 0 40px rgba(0, 212, 160, 0.12)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'slide-in': 'slideIn 0.4s ease forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}

export default config
