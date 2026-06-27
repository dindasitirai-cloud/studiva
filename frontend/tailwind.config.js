/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#003366',
        gold: '#FFD700',
        skyblue: '#5DADE2',
        cream: '#FFF8E7',
        background: '#FFF8E7',
        softpink: '#FFB3D9',
        softpurple: '#D4B5F0',
        softyellow: '#FFE680',
        softgreen: '#A8E6CF',
        success: '#2F9E6F',
        bordergray: '#E8E0D0',
        textdark: '#33415C',
        textlight: '#6B7A99',

        // shadcn-style semantic tokens, mapped onto the existing Studiva
        // palette above instead of introducing a separate color system.
        border: '#E8E0D0',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#33415C',
        },
        secondary: {
          DEFAULT: '#F1F1F1',
          foreground: '#33415C',
        },
        muted: {
          DEFAULT: '#F1F1F1',
          foreground: '#6B7A99',
        },
        'sky-start': '#BEE3F8',
        'sky-end': '#5DADE2',
      },
      fontFamily: {
        sans: ['Nunito', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
        display: ['Poppins', 'Nunito', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        h1: ['3.25rem', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        h2: ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        h3: ['1.5rem', { lineHeight: '1.25' }],
      },
      borderRadius: {
        blob: '60% 40% 30% 70% / 60% 30% 70% 40%',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(3deg)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};
