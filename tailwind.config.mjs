/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Paleta premium minimalista - blancos cálidos
        warm: {
          50: '#FDFCFB',   // Blanco cálido más puro
          100: '#FAF9F7',  // Blanco cálido suave
          200: '#F5F4F2',  // Gris cálido muy claro
          300: '#EDEBE8',  // Gris cálido claro
          400: '#D6D4D0',  // Gris cálido medio
        },
        // Paleta para restaurante de completos/churrascos
        tomato: {
          50: '#FFF5F5',
          100: '#FFE5E5',
          200: '#FFCCCC',
          300: '#FF9999',
          400: '#FF6666',
          500: '#FF4444',
          600: '#E63946',
          700: '#CC2936',
          800: '#B31E2A',
          900: '#99131E',
        },
        orange: {
          50: '#FFF8F0',
          100: '#FFEED6',
          200: '#FFDCAD',
          300: '#FFC985',
          400: '#FFB75C',
          500: '#FF9500',
          600: '#E68500',
          700: '#CC7500',
          800: '#B36500',
          900: '#995500',
        },
        fresh: {
          white: '#FFFFFF',
          cream: '#FAF9F7',  // Blanco cálido premium
          light: '#F5F4F2',  // Gris cálido muy suave
          gray: '#EDEBE8',   // Gris cálido claro
        },
        accent: {
          green: '#22C55E',
          red: '#EF4444',
          yellow: '#FBBF24',
        },
        brand: {
          DEFAULT: '#FF4444',
          light: '#FF6666',
          dark: '#E63946',
        }
      },
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'display': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
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




