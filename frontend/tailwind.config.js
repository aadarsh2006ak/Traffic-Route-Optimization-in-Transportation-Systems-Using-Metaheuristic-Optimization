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
        hud: {
          bg: '#040711',
          card: '#060a16',
          cardHover: '#0a1024',
          border: '#0d182b',
          borderActive: '#1a2f52',
          cyan: '#00f0ff',
          mint: '#00ff9d',
          amber: '#ffb700',
          purple: '#bf5af2',
          rose: '#ff3b30',
          blue: '#2b7fff',
          textMuted: '#526685',
          textBright: '#d8e5f8',
        },
      },
      fontFamily: {
        hud: ['"Share Tech Mono"', '"JetBrains Mono"', 'monospace'],
        mono: ['"JetBrains Mono"', '"Share Tech Mono"', 'monospace'],
        display: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'hud-cyan': '0 0 15px -2px rgba(0, 240, 255, 0.4)',
        'hud-mint': '0 0 15px -2px rgba(0, 255, 157, 0.4)',
        'hud-amber': '0 0 15px -2px rgba(255, 183, 0, 0.4)',
        'hud-purple': '0 0 15px -2px rgba(191, 90, 242, 0.4)',
        'hud-panel': 'inset 0 0 20px 0 rgba(0, 240, 255, 0.02), 0 4px 20px 0 rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'laser-glow': 'laser 2s infinite alternate',
      },
    },
  },
  plugins: [],
}
