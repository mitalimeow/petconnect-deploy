import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          pink: '#FFB7B2',
          blue: '#B5EAD7',
          yellow: '#E2F0CB',
          purple: '#B19EEF',
          bg: '#FDFBF7',
        },
        primary: {
          DEFAULT: '#FFB7B2',
          foreground: '#3A3A3A',
        },
        background: '#FDFBF7',
        foreground: '#3A3A3A',
        border: '#E8E8E8',
      },
      fontFamily: {
        body: ['Nunito', 'sans-serif'],
        handwritten: ['Caveat', 'cursive'],
        raleway: ['Raleway', 'sans-serif'],
        playwrite: ['"Playwrite US Trad"', 'cursive'],
        poppins: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(0,0,0,0.08)',
      }
    },
  },
  plugins: [
    typography
  ],
}

