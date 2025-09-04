/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Hauptfarben
        primary: '#2c3e50',
        secondary: '#999999',
        accent: '#5f9ea0',
        warning: '#ffcc00',
        'text-dark': '#555555',
        'text-light': '#e1e6eb',
        gray: '#7f8c8d',
        'light-gray': '#beccd9',
        'lighter-blue': '#e0f7f7',
        blue: '#3498db',
        'dark-blue': '#2980b9',
        white: '#ffffff',
        red: '#ff7675',
        'dark-red': '#c0392b',
        orange: '#f39c12',
        'dark-hue': '#34495e',
        prestige: '#e6c200',
        'prestige-dark': '#bfa100',

        // Hintergrundfarben
        'bg-dark': '#20242a',
        'bg-darker': '#181c20',
        'bg-off-dark': '#23272e',
        'bg-light': '#f5f5f5',
        'bg-lighter-blue': '#e0f7f7',
        'bg-off-white': '#f8f9fa',
        'bg-transparent-black-30': 'rgba(0,0,0,0.3)',
        'bg-transparent-black-90': 'rgba(0,0,0,0.9)',
        'bg-transparent-white-10': 'rgba(255,255,255,0.1)',
        'bg-transparent-white-30': 'rgba(255,255,255,0.3)',
        'bg-transparent-white-90': 'rgba(255,255,255,0.9)',

        // Button-Farben
        'button-green': '#2ecc71',
        'button-green-dark': '#27ae60',
        'button-yellow': '#f1c61d',
        'button-yellow-dark': '#deb71c',
        'button-red': '#e74c3c',
        'button-red-dark': '#c0392b',
        'button-purple': '#9b59b6',
        'button-purple-dark': '#8e44ad',
      },
    },
  },
  plugins: [],
}
