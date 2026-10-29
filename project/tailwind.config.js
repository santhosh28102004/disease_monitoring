/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
          light: '#DBEAFE',
        },
        sidebar: {
          bg: '#0F172A',
          active: '#1E3A8A',
        },
        success: {
          text: '#166534',
          bg: '#DCFCE7',
          icon: '#16A34A',
        },
        warning: {
          text: '#92400E',
          bg: '#FEF3C7',
          icon: '#F59E0B',
        },
        danger: {
          text: '#991B1B',
          bg: '#FEE2E2',
          icon: '#EF4444',
        },
        app: {
          bg: '#F1F5F9',
          card: '#FFFFFF',
        },
        border: {
          DEFAULT: '#E2E8F0',
        },
        ink: {
          DEFAULT: '#0F172A',
          muted: '#64748B',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.08)',
      },
    },
  },
  plugins: [],
};
