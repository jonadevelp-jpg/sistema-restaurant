/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FEF9E7',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#D4AF37',
          600: '#B8941F',
          700: '#9A7A1A',
          800: '#7C5F15',
          900: '#5E4710',
        },
        terracotta: {
          50: '#FDF4F0',
          100: '#FAE6D9',
          200: '#F5CCB3',
          300: '#EFB28D',
          400: '#E89867',
          500: '#C17A4A',
          600: '#9E6239',
          700: '#7B4A28',
          800: '#583217',
          900: '#351A06',
        },
        arabic: {
          dark: '#3E2723',
          brown: '#654321',
          beige: '#F5E6D3',
          cream: '#FFF8E7',
        },
        brand: {
          DEFAULT: '#D4AF37',
        }
      },
      fontFamily: {
        'cinzel': ['Cinzel', 'serif'],
        'playfair': ['Playfair Display', 'serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.6s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}


