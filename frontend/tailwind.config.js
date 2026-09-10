/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#050711',
          card: 'rgba(17, 24, 39, 0.8)',
          border: 'rgba(0, 243, 255, 0.2)',
          cyan: '#00f3ff',
          neonPurple: '#bc13fe',
          green: '#00e676',
          orange: '#ff9100',
          red: '#ff2b2b',
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 243, 255, 0.35)',
        'neon-purple': '0 0 15px rgba(188, 19, 254, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
