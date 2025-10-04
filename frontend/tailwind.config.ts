import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0C2340',
        mint: '#6BF0B5',
        mintLight: '#CFFAE7',
        off: '#F6F8FB',
        text: '#EAF0FF',
        body: '#C8D0E0',
      },
      borderRadius: {
        '2xl': '1.25rem', // 20px
        '3xl': '1.5rem',  // 24px
      },
      boxShadow: {
        soft: '0 6px 24px rgba(0,0,0,0.08)',
      }
    }
  },
  plugins: []
}
export default config
