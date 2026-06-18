import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#00338D',
          interactive: '#1E49E2',
          light: '#E8EDF5',
        },
        status: {
          success: '#009A44',
          warning: '#FF6B00',
          danger: '#D32F2F',
          pending: '#757575',
        },
        accent: {
          gold: '#C5A04E',
        },
        page: '#FAFBFC',
        card: '#FFFFFF',
        'text-primary': '#1A1A2E',
        'text-secondary': '#4A4A5A',
        'text-muted': '#8C8C9A',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '8px',
        btn: '6px',
        input: '4px',
        tag: '4px',
        modal: '12px',
      },
      boxShadow: {
        L1: '0 1px 3px rgba(0, 0, 0, 0.08)',
        L2: '0 4px 12px rgba(0, 0, 0, 0.12)',
        L3: '0 8px 24px rgba(0, 0, 0, 0.16)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite linear',
      },
    },
  },
  plugins: [],
} satisfies Config
