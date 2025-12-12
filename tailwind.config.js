/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dgalu-rose': {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
        },
        'dgalu-amber': {
          400: '#fbbf24',
          500: '#f59e0b',
        },
        // Theme-aware colors using CSS variables
        'primary': 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        'primary-light': 'var(--color-primary-light)',
        'primary-dark': 'var(--color-primary-dark)',
        'secondary': 'var(--color-secondary)',
        'secondary-hover': 'var(--color-secondary-hover)',
      },
      backgroundColor: {
        'theme': 'var(--color-background)',
        'theme-secondary': 'var(--color-background-secondary)',
        'theme-tertiary': 'var(--color-background-tertiary)',
      },
      textColor: {
        'theme': 'var(--color-text)',
        'theme-secondary': 'var(--color-text-secondary)',
        'theme-muted': 'var(--color-text-muted)',
      },
      borderColor: {
        'theme': 'var(--color-border)',
        'theme-light': 'var(--color-border-light)',
      },
      fontFamily: {
        'serif': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'sans-serif'],
      },
      zIndex: {
        'base': 'var(--z-base)',
        'content': 'var(--z-content)',
        'navbar': 'var(--z-navbar)',
        'sidebar': 'var(--z-sidebar)',
        'overlay': 'var(--z-overlay)',
        'modal': 'var(--z-modal)',
        'toast': 'var(--z-toast)',
      }
    },
  },
  plugins: [],
}

