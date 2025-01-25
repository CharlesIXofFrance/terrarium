/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      spacing: {
        'section': '1.5rem',
        'content': '1rem',
        'container-sm': '24px',
        'container-md': '32px',
        'container-lg': '48px'
      },
      screens: {
        'sm': '576px',
        'md': '768px',
        'lg': '1024px'
      },
      colors: {
        border: {
          DEFAULT: 'hsl(var(--border) / <alpha-value>)',
        },
        primary: {
          DEFAULT: '#0F4C75',
          50: '#E6F1F9',
          100: '#CCE4F3',
          200: '#99C9E8',
          300: '#66ADDC',
          400: '#3392D1',
          500: '#0F4C75',
          600: '#0C3D5E',
          700: '#092E47',
          800: '#061F30',
          900: '#030F18'
        },
        secondary: {
          DEFAULT: '#BBE1FA',
          50: '#FFFFFF',
          100: '#FFFFFF',
          200: '#FFFFFF',
          300: '#FFFFFF',
          400: '#DEF0FC',
          500: '#BBE1FA',
          600: '#89CCF7',
          700: '#57B7F4',
          800: '#25A2F1',
          900: '#0B85D2'
        },
        accent: {
          DEFAULT: '#3282B8',
          50: '#DBE8F2',
          100: '#C7DCEC',
          200: '#9FC5E0',
          300: '#77AED3',
          400: '#4F97C7',
          500: '#3282B8',
          600: '#28668F',
          700: '#1E4B67',
          800: '#14303F',
          900: '#0A1517'
        },
        text: {
          DEFAULT: '#1B262C',
          link: '#3282B8'
        },
        background: '#F3F4F6',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
        },
      },
      gridTemplateColumns: {
        'main': '40% 60%',
      },
      fontFamily: {
        heading: ['Montserrat', 'sans-serif'],
        body: ['Roboto', 'sans-serif']
      },
      transitionDuration: {
        '250': '250ms',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
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
      animation: {
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'scale-up': 'scaleUp 250ms ease-out',
        'tooltip': 'tooltip 200ms ease-out'
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