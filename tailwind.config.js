/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5B4CF5',
          hover: '#4A3CE0',
          soft: '#EDE9FE',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#1A1625',
          soft: '#F1F0FF',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#F59E0B',
          soft: '#FEF3C7',
          foreground: '#FFFFFF',
        },
        success: {
          DEFAULT: '#10B981',
          hover: '#059669',
          soft: '#D1FAE5',
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT: '#F59E0B',
          hover: '#D97706',
          soft: '#FEF3C7',
          foreground: '#FFFFFF',
        },
        danger: {
          DEFAULT: '#EF4444',
          hover: '#DC2626',
          soft: '#FEE2E2',
          foreground: '#FFFFFF',
        },
        info: {
          DEFAULT: '#3B82F6',
          hover: '#2563EB',
          soft: '#DBEAFE',
          foreground: '#FFFFFF',
        },
        neutral: {
          bg: '#F7F7FB',
          surface: '#FFFFFF',
          border: '#E4E2F0',
          'text-primary': '#1A1625',
          'text-secondary': '#4B4869',
          'text-muted': '#7C7A9B',
          disabled: '#A8A6C3',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        display: [
          '"Plus Jakarta Sans"',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(91 76 245 / 0.04), 0 1px 6px 0 rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 12px 0 rgb(91 76 245 / 0.08), 0 1px 4px 0 rgb(0 0 0 / 0.06)',
        dropdown: '0 8px 24px -4px rgb(0 0 0 / 0.12), 0 2px 8px -2px rgb(0 0 0 / 0.08)',
        modal: '0 24px 48px -8px rgb(0 0 0 / 0.18), 0 8px 16px -4px rgb(0 0 0 / 0.1)',
      }
    },
  },
  plugins: [],
}
