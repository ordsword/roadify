/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: {
          bg: '#0c0e17',
          card: '#131622',
          cardHover: '#181b2a',
          border: '#232740',
          borderLight: '#323759',
          muted: '#8b93b5',
          header: '#0f111c'
        },
        roadify: {
          green: '#10b981',
          greenLight: '#34d399',
          blue: '#3b82f6',
          purple: '#8b5cf6',
          amber: '#f59e0b',
          rose: '#f43f5e',
          cyan: '#06b6d4'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
