/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Rekah brand tokens — Langit Peony v1.0
        rekah:        '#F06BA8',   // Peony Pink primary
        'rekah-tua':  '#D04595',   // deeper pink
        'rose-soft':  '#F8B9D4',   // Peony soft (light pink)
        'rose-deep':  '#E05898',   // mid-deep pink
        mawar:        '#F8B9D4',   // = rose-soft / peony
        fajar:        '#FFF0F7',   // very light pink for hover states
        kanvas:       '#FFF3E6',   // warm cream background
        langit:       '#8FB8F7',   // sky blue companion
        ungu:         '#C9B8F0',   // lilac accent
        kuning:       '#FFE29A',   // butter yellow
        daun:         '#4E9C6E',   // botanical green (leaves/stems)
        leaf:         '#7A9E6E',
        soil:         '#A8846B',
        'ink-soft':   '#8A7080',   // muted plum for body text
        pucuk:        '#F0E8F4',   // soft lilac tint for bg
        madu:         '#F6B860',   // amber (logo center)
        pekat:        '#6E3B57',   // Plum (main text)

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

        // "stv-" tokens: the Home Page Sections design-handoff palette
        // (design_handoff_studiva_home/STUDIVA_DESIGN_SYSTEM.md). Kept
        // separate from the tokens above so this redesign doesn't shift
        // colors on pages that haven't been migrated to it yet.
        'stv-navy': '#103A6B',
        'stv-navy-dark': '#0C2E54',
        'stv-navy-grad-1': '#0E3766',
        'stv-navy-grad-2': '#15406F',
        'stv-yellow': '#FBD00A',
        'stv-yellow-hover': '#F5C800',
        'stv-yellow-deep': '#E0A800',
        'stv-yellow-tint': '#FFF3CC',
        'stv-sky': '#5FB0DD',
        'stv-sky-stroke': '#2E8BC9',
        'stv-sky-tint': '#E4F1FB',
        'stv-coral': '#E07B4F',
        'stv-coral-tint': '#FCE7DD',
        'stv-cream': '#FCF4DE',
        'stv-beige': '#EDE8DA',
        'stv-body': '#5C6B85',
        'stv-muted': '#6B7790',
        'stv-muted-2': '#94A0B8',
        'stv-quote': '#2E3A52',
        'stv-border': '#EEF0F4',
        'stv-badge-navy-tint': '#E7EEF7',
        'stv-green': '#3FBF6A',
        'stv-green-tint': '#E7F7EF',
      },
      fontFamily: {
        // Rekah typefaces — Langit Peony v1.0
        bricolage: ["'Fredoka'", 'system-ui', 'sans-serif'],  // heading
        fredoka:   ["'Fredoka'", 'system-ui', 'sans-serif'],  // alias
        jakarta:   ["'Nunito'", 'system-ui', 'sans-serif'],   // body
        nunito:    ["'Nunito'", 'system-ui', 'sans-serif'],   // alias
        fraunces:  ["'Shantell Sans'", 'cursive'],            // accent (was Fraunces)
        caveat:    ["'Shantell Sans'", 'cursive'],            // accent (was Caveat)
        shantell:  ["'Shantell Sans'", 'cursive'],            // alias

        sans: ["'Plus Jakarta Sans'", 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Nunito', 'Segoe UI', 'sans-serif'],
        baloo: ["'Baloo 2'", 'cursive'],
        'nunito-sans': ["'Nunito Sans'", 'sans-serif'],
        hand: ["'Patrick Hand'", 'cursive'],
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
        stvFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-18px)' },
        },
        stvFloatSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(14px)' },
        },
        rekahBloomIn: {
          '0%':   { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        sway: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%':      { transform: 'rotate(3deg)' },
        },
        sway2: {
          '0%, 100%': { transform: 'rotate(3deg)' },
          '50%':      { transform: 'rotate(-3deg)' },
        },
      },
      animation: {
        'rekah-bloom': 'rekahBloomIn 220ms ease-out both',
        sway:  'sway 8s ease-in-out infinite',
        sway2: 'sway2 9s ease-in-out infinite',
        floaty: 'floaty 6s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out both',
        'stv-float': 'stvFloat 9s ease-in-out infinite',
        'stv-float-slow': 'stvFloatSlow 11s ease-in-out infinite',
      },
    },
  },
  safelist: ['animate-rekah-bloom', 'animate-sway', 'animate-sway2'],
  plugins: [],
};
