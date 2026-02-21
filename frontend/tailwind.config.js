/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0a2354', // Navy blue
          light: '#1a3a80',
          dark: '#071940',
        },
        secondary: {
          DEFAULT: '#4a90e2', // Light blue
        },
        accent: {
          DEFAULT: '#e74c3c', // Red for alerts/important info
        },
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100%',
            color: '#333',
            h1: {
              color: '#0a2354',
            },
            h2: {
              color: '#0a2354',
            },
            h3: {
              color: '#0a2354',
            },
            a: {
              color: '#4a90e2',
              '&:hover': {
                color: '#1a3a80',
              },
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}