/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Ensures Tailwind scans all relevant files
  ],
  darkMode: 'class', // Enables dark mode using 'class' strategy
  theme: {
    extend: {}, // Extend this for custom styling
  },
  plugins: [], // Add Tailwind plugins here if needed
};


