/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
  safelist: [
    'bg-blue-50', 'text-blue-600',
    'bg-emerald-50', 'text-emerald-600',
    'bg-purple-50', 'text-purple-600',
    'bg-amber-50', 'text-amber-600',
    'accent-blue-500', 'accent-emerald-500', 'accent-purple-500'
  ]
}
