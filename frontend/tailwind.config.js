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
          50: '#F4F6F9',
          100: '#E6EAF0',
          200: '#C8D1DF',
          300: '#9FB0C8',
          400: '#6C83A6',
          500: '#465D82',
          600: '#2F4263',
          700: '#1F2C45',
          800: '#141D2E',
          900: '#0B1220',
          950: '#060A13',
        },
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        paypal: {
          blue: '#0070BA',
          darkBlue: '#003087',
          lightBlue: '#0079C1',
          yellow: '#FFC439',
        },
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
      },
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
        'card': '0 0 0 1px rgba(11, 18, 32, 0.04), 0 2px 8px -2px rgba(11, 18, 32, 0.06)',
        'card-hover': '0 0 0 1px rgba(99, 102, 241, 0.2), 0 8px 24px -4px rgba(11, 18, 32, 0.08)',
        'elevated': '0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}

