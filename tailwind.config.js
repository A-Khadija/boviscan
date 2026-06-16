/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        'bovin-black': 'var(--bg-primary)',
        'bovin-dark': 'var(--bg-secondary)',
        'bovin-surface': 'var(--bg-surface)',
        'bovin-surface-hover': 'var(--bg-surface-hover)',
        'bovin-border': 'var(--border-color)',
        'bovin-border-light': 'var(--border-light)',
        'bovin-green': 'var(--accent)',
        'bovin-green-dim': 'var(--accent-dim)',
        'bovin-green-glow': 'var(--accent-glow)',
        'bovin-red': 'var(--error)',
        'bovin-amber': 'var(--warning)',
        'bovin-gray': 'var(--text-muted)',
        'bovin-gray-light': 'var(--text-secondary)',
        'bovin-text': 'var(--text-primary)',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Arabic', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan-line': 'scanLine 2s linear infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 5px var(--accent-glow)' },
          '50%': { boxShadow: '0 0 20px var(--accent-glow)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
