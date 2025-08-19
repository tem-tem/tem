/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        'garamond': ['New York', 'serif'],
        'serif': ['Instrument Serif', 'serif'],
      }
    },
  },
  plugins: [],
}

