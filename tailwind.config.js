/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      spacing: {
        'section': '1.5rem',
        'content': '1rem',
      },
      screens: {
        'sm': '576px',
        'md': '768px',
        'lg': '1024px'
      },
      colors: {
        primary: '#0F4C75',
        secondary: '#BBE1FA',
        accent: '#3282B8',
        text: {
          DEFAULT: '#1B262C',
          link: '#3282B8'
        },
        background: '#F3F4F6'
      },
      gridTemplateColumns: {
        'main': '40% 60%',
      },
      fontFamily: {
        heading: ['Montserrat', 'sans-serif'],
        body: ['Roboto', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease-in',
        'scale-up': 'scaleUp 250ms ease-out',
        'tooltip': 'tooltip 200ms ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        scaleUp: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.02)' }
        },
        tooltip: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      spacing: {
        'container-sm': '24px',
        'container-md': '32px',
        'container-lg': '48px'
      },
      fontSize: {
        'mobile': '75%',
        'tablet': '85%',
        'desktop': '100%'
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#1B262C',
            strong: {
              color: '#1B262C',
              fontWeight: '600',
            },
            p: {
              marginTop: '0.5em',
              marginBottom: '0.5em',
            },
            ul: {
              marginTop: '0.5em',
              marginBottom: '0.5em',
            },
            li: {
              marginTop: '0.25em',
              marginBottom: '0.25em',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography')
  ],
};