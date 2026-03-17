/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f3f8',
          100: '#d9e1ee',
          200: '#b3c3dc',
          300: '#8da5cb',
          400: '#6787b9',
          500: '#4169a8',
          600: '#2d4e87',
          700: '#243f6e',
          800: '#1B263B',
          900: '#0f1725',
        },
        sienna: {
          50: '#fdf4f1',
          100: '#fae5dd',
          200: '#f5cbbb',
          300: '#eea78f',
          400: '#e88261',
          500: '#E76F51',
          600: '#d95530',
          700: '#b54025',
          800: '#923424',
          900: '#782e24',
        },
        offwhite: '#F8F9FA',
        cream: '#F5F0E8',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Source Sans 3"', '"Source Sans Pro"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'crisp': '0 1px 3px rgba(0,0,0,0.08)',
        'elevated': '0 4px 16px rgba(27,38,59,0.1)',
        'none': 'none',
      },
      borderRadius: {
        'sm': '2px',
        DEFAULT: '4px',
        'md': '6px',
      },
    },
  },
  plugins: [],
}
