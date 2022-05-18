const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      container: {
        padding: '1rem',
      },
      fontFamily: {
        sans: ['CabinVariable', ...defaultTheme.fontFamily.sans],
        display: ['CabinVariable', ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        progress: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(50%)' },
        },
      },
    },
  },
  plugins: [],
};
