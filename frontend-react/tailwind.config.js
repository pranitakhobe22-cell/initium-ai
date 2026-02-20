/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F7CAC',
          dark: '#3d618a',
        },
        secondary: {
          DEFAULT: '#A7C7E7',
          light: '#d1e3f5',
        },
        background: '#F4F7FA',
        surface: '#ffffff',
        text: {
          main: '#2E3A59',
          muted: '#6b7280',
        },
        success: '#6BCB77',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 12px rgba(46, 58, 89, 0.05)',
        'md': '0 8px 16px rgba(46, 58, 89, 0.08)',
      }
    },
  },
  plugins: [],
}
