/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#123B5D',
          secondary: '#1D6A8A',
          accent: '#E5A83B',
          accentHover: '#cf9227',
          bg: '#F7F9FB',
          surface: '#FFFFFF',
          text: '#17212B',
          muted: '#687582',
          border: '#E4E9EE',
          dark: '#0A1E2F',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'premium': '0 10px 30px -5px rgba(18, 59, 93, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 20px -2px rgba(18, 59, 93, 0.06)',
      }
    },
  },
  plugins: [],
}
