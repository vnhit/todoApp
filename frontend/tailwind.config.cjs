/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./src/**/*.js"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        brand: {
          orange: '#FF6700', // Màu cam Figma
          dark: '#0F1115'    // Màu đen Sidebar
        }
      }
    },
  },
  plugins: [],
}
