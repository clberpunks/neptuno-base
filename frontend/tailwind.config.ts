// frontend/tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'blue-dark': '#2C3E50',
        'green': '#00E676',
        'red': '#FF3B30',
        'orange': '#FF9500',
        'mint': '#5AC8FA',
        'white-soft': '#FDFDFD'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        grotesk: ['Space Grotesk', 'sans-serif']
      }
    }
  },
  plugins: []
}

export default config
