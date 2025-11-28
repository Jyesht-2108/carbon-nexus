/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#00F6FF',
          dark: '#00D4DD',
          light: '#75E7FB',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#FF7A1A',
          light: '#FFC53D',
          dark: '#E66A0A',
        },
        neon: {
          cyan: '#00F6FF',
          teal: '#0EF1C7',
          blue: '#75E7FB',
          orange: '#FF7A1A',
          yellow: '#FFC53D',
        },
        surface: {
          light: '#F8FAFC',
          dark: '#00141E',
          'dark-mid': '#001B26',
          'dark-elevated': '#002532',
          'dark-card': 'rgba(255, 255, 255, 0.03)',
        },
        text: {
          bright: '#F0FEFF',
          muted: '#7AA7B8',
        },
        chart: {
          cyan: '#00F6FF',
          teal: '#0EF1C7',
          orange: '#FF7A1A',
          blue: '#75E7FB',
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        heading: ['Poppins', 'Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
        normal: '0em',
        wide: '0.02em',
        wider: '0.04em',
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
        wide: '0.02em',
        wider: '0.04em',
      },
      boxShadow: {
        'glass': '0 0 40px rgba(0, 0, 0, 0.35)',
        'glass-dark': '0 0 40px rgba(0, 0, 0, 0.35)',
        'premium': '0 0 40px rgba(0, 0, 0, 0.35)',
        'premium-lg': '0 0 60px rgba(0, 246, 255, 0.15)',
        'glow-sm': '0 0 10px rgba(0, 246, 255, 0.3)',
        'glow': '0 0 20px rgba(0, 246, 255, 0.5)',
        'glow-lg': '0 0 30px rgba(0, 246, 255, 0.6)',
        'glow-accent': '0 0 25px rgba(255, 122, 26, 0.5)',
        'glow-orange': '0 0 30px rgba(255, 122, 26, 0.6)',
        'glow-orange-lg': '0 0 40px rgba(255, 122, 26, 0.7)',
        'inner-glow': 'inset 0 0 20px rgba(0, 246, 255, 0.15)',
        'neon-cyan': '0 0 20px rgba(0, 246, 255, 0.5), 0 0 40px rgba(0, 246, 255, 0.3)',
        'neon-orange': '0 0 20px rgba(255, 122, 26, 0.6), 0 0 40px rgba(255, 122, 26, 0.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'radial-gradient(at 40% 20%, hsla(174, 72%, 56%, 0.3) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(226, 71%, 50%, 0.3) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(174, 72%, 56%, 0.2) 0px, transparent 50%)',
        'gradient-premium': 'linear-gradient(135deg, rgba(14, 165, 160, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease-out',
        'fade-in-up': 'fadeInUp 0.35s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'slide-down': 'slideDown 0.35s ease-out',
        'scale-in': 'scaleIn 0.35s ease-out',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'glow-pulse-fast': 'glowPulse 1.5s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'border-flow': 'borderFlow 3s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'draw-line': 'drawLine 1.5s ease-out forwards',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 246, 255, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 246, 255, 0.7)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        borderFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        drawLine: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        pulseDot: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.2)', opacity: '0.8' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
