/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './context/**/*.{js,ts,jsx,tsx,mdx}',
    './store/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: 'var(--background)',
          dark: '#0C0A0F',
          light: '#F7F3F0',
          alt: 'var(--background-alt)'
        },
        surface: {
          DEFAULT: 'var(--surface)',
          dark: '#141117',
          light: '#FFFDFC',
          elevated: 'var(--surface-elevated)',
          'elevated-dark': '#1A151D',
          hover: 'var(--surface-hover)',
          'hover-dark': '#211B24',
          selected: 'var(--surface-selected)',
          'selected-dark': '#261D28'
        },
        border: {
          DEFAULT: 'var(--border)',
          dark: '#2A242D',
          light: '#E5DCD5',
          strong: 'var(--border-strong)',
          subtle: 'var(--border-subtle)'
        },
        text: {
          primary: 'var(--text-primary)',
          'primary-dark': '#F5F1F3',
          secondary: 'var(--text-secondary)',
          'secondary-dark': '#B8AEB9',
          muted: 'var(--text-muted)',
          'muted-dark': '#817783'
        },
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          active: 'var(--primary-active)',
          bright: 'var(--primary-bright)',
          soft: 'var(--primary-soft)',
          highlight: 'var(--primary-highlight)'
        },
        copper: {
          DEFAULT: 'var(--primary)',
          50: '#FDF8F5',
          100: '#F9EDE4',
          200: '#F3DAC9',
          300: '#E9BF9F',
          400: '#DDA175',
          500: '#C08457',
          600: '#A9683F',
          700: '#8A4F2E',
          800: '#714128',
          900: '#5D3723',
          hover: 'var(--primary-hover)',
          active: 'var(--primary-active)',
          bright: 'var(--primary-bright)',
          soft: 'var(--primary-soft)'
        },
        plum: {
          DEFAULT: 'var(--plum)',
          50: '#FAF5F9',
          100: '#F4EAF3',
          200: '#EAD6E7',
          300: '#DBB8D5',
          400: '#C391BC',
          500: '#8B5C86',
          600: '#6E456B',
          700: '#5B3758',
          800: '#4C2F49',
          900: '#3F273D',
          bright: 'var(--plum-bright)',
          soft: 'var(--plum-soft)'
        },
        lavender: {
          DEFAULT: 'var(--ai)',
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#B7AAFF',
          500: '#9B8AFB',
          600: '#705BC9',
          700: '#5B45B3',
          800: '#4C3996',
          900: '#3F307C',
          bright: 'var(--ai-bright)',
          soft: 'var(--ai-soft)'
        },
        ai: {
          DEFAULT: 'var(--ai)',
          bright: 'var(--ai-bright)',
          soft: 'var(--ai-soft)',
          dark: '#9B8AFB',
          light: '#705BC9'
        },
        gold: {
          DEFAULT: '#D6A86C',
          light: '#A8793D',
          dark: '#D6A86C'
        },
        cream: {
          DEFAULT: '#F2E6D8',
          light: '#FFF8F1',
          dark: '#F2E6D8'
        },
        success: {
          DEFAULT: '#3FA77A',
          soft: 'var(--success-soft)',
          dark: '#3FA77A',
          light: '#3FA77A'
        },
        warning: {
          DEFAULT: '#D29A4A',
          soft: 'var(--warning-soft)',
          dark: '#D29A4A',
          light: '#D29A4A'
        },
        danger: {
          DEFAULT: '#D76565',
          soft: 'var(--danger-soft)',
          dark: '#D76565',
          light: '#D76565'
        },
        info: {
          DEFAULT: '#7E9FD6',
          soft: 'var(--info-soft)',
          dark: '#7E9FD6',
          light: '#7E9FD6'
        },
        /* Backwards-compatibility aliases */
        brand: {
          DEFAULT: 'var(--primary)',
          50: '#FDF8F5',
          100: '#F9EDE4',
          200: '#F3DAC9',
          300: '#E9BF9F',
          400: '#DDA175',
          500: '#C08457',
          600: '#A9683F',
          700: '#8A4F2E',
          800: '#714128',
          900: '#5D3723'
        },
        sapphire: {
          DEFAULT: 'var(--primary)',
          50: '#FDF8F5',
          100: '#F9EDE4',
          200: '#F3DAC9',
          300: '#E9BF9F',
          400: '#DDA175',
          500: '#C08457',
          600: '#A9683F',
          700: '#8A4F2E',
          800: '#714128',
          900: '#5D3723'
        }
      },
      borderRadius: {
        control: '8px',
        card: '12px',
        modal: '16px'
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px 0 rgba(12, 10, 15, 0.12), 0 1px 2px -1px rgba(12, 10, 15, 0.08)',
        'elevated': '0 4px 12px -2px rgba(12, 10, 15, 0.24), 0 2px 6px -2px rgba(12, 10, 15, 0.16)',
        'modal': '0 20px 30px -5px rgba(12, 10, 15, 0.45), 0 8px 12px -6px rgba(12, 10, 15, 0.3)',
        'glow-copper': '0 0 25px -3px rgba(192, 132, 87, 0.35)',
        'glow-lavender': '0 0 25px -3px rgba(155, 138, 251, 0.35)'
      },
      keyframes: {
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-8px) rotate(0.4deg)' }
        },
        'float-delayed': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(8px) rotate(-0.4deg)' }
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.35', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' }
        },
        'shimmer-sweep': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(250%)' }
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '30%': { opacity: '0.8' },
          '70%': { opacity: '0.8' },
          '100%': { transform: 'translateY(250%)', opacity: '0' }
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'float-slow': 'float-slow 6s ease-in-out infinite',
        'float-delayed': 'float-delayed 7s ease-in-out 1s infinite',
        'float-reverse': 'float-reverse 5s ease-in-out 0.5s infinite',
        'pulse-glow': 'pulse-glow 5s ease-in-out infinite',
        'shimmer-sweep': 'shimmer-sweep 3.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan-line': 'scan-line 3s ease-in-out infinite',
        'spin-slow': 'spin 16s linear infinite',
        'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards'
      }
    }
  },
  plugins: []
};
