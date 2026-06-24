/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./**/*.html",
    "./**/*.js"
  ],
  darkMode: 'class',
  theme: {
      extend: {
          fontFamily: {
              sans: ['Inter', 'system-ui', 'sans-serif'],
              serif: ['Merriweather', 'serif'],
          },
          colors: {
              brand: {
                  50: '#fffbeb',
                  100: '#fef3c7',
                  500: '#f59e0b',
                  600: '#d97706',
                  900: '#78350f',
              },
              tulip: {
                  50: '#fdf2f8',
                  100: '#fce7f3',
                  200: '#fbcfe8',
                  300: '#f9a8d4',
                  400: '#f472b6',
                  500: '#ec4899',
                  600: '#db2777',
                  700: '#be185d',
                  800: '#9d174d',
                  900: '#831843',
                  950: '#500724',
              }
          },
          animation: {
              'spin-slow': 'spin 8s linear infinite',
              'bounce-slow': 'bounce 3s infinite',
              'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              'sunflower-click': 'pop 0.2s ease-out',
              'float-up': 'floatUp 1s ease-out forwards',
              'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
              'heartbeat-fast': 'heartbeat 0.8s ease-in-out infinite',
          },
          keyframes: {
              pop: { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(0.8)' }, '100%': { transform: 'scale(1.1)' } },
              floatUp: { '0%': { opacity: '1', transform: 'translateY(0) scale(1)' }, '100%': { opacity: '0', transform: 'translateY(-50px) scale(1.5)' } },
              shake: { '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' }, '20%, 80%': { transform: 'translate3d(2px, 0, 0)' }, '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' }, '40%, 60%': { transform: 'translate3d(4px, 0, 0)' } },
              heartbeat: { '0%, 100%': { transform: 'scale(1)' }, '25%': { transform: 'scale(1.15)' }, '50%': { transform: 'scale(1)' }, '75%': { transform: 'scale(1.15)' } }
          }
      }
  }
}
