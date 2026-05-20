/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          green: '#00ff88',
          'green-dim': '#00cc6a',
          cyan: '#00d4ff',
          yellow: '#ffd700',
          red: '#ff4757',
          orange: '#ff6b35',
          purple: '#a855f7',
          bg: '#0a0b0d',
          'bg-2': '#0f1117',
          card: '#13161e',
          'card-2': '#1a1f2e',
          border: 'rgba(0, 255, 136, 0.12)',
          'border-active': 'rgba(0, 255, 136, 0.4)',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'grid-dark': "linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)",
        'grid-light': "linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      animation: {
        'cursor-blink': 'cursorBlink 1s step-end infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'scan-line': 'scanLine 4s linear infinite',
        'terminal-flash': 'terminalFlash 0.1s ease-out',
        'number-ticker': 'numberTicker 0.5s ease-out',
      },
      keyframes: {
        cursorBlink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        glowPulse: {
          '0%': { boxShadow: '0 0 5px rgba(0,255,136,0.3), 0 0 10px rgba(0,255,136,0.1)' },
          '100%': { boxShadow: '0 0 15px rgba(0,255,136,0.6), 0 0 30px rgba(0,255,136,0.2)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(5px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scanLine: {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
        terminalFlash: {
          '0%': { backgroundColor: 'rgba(0,255,136,0.2)' },
          '100%': { backgroundColor: 'transparent' },
        },
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(0,255,136,0.3)',
        'glow-cyan': '0 0 20px rgba(0,212,255,0.3)',
        'glow-red': '0 0 20px rgba(255,71,87,0.3)',
        'inner-glow': 'inset 0 0 30px rgba(0,255,136,0.05)',
      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
