import type { Config } from 'tailwindcss'
export default {
  content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}'],
  theme: { extend: {
    colors:{ parchment:'#e8ddc7', temple:'#1e3440', rune:'#78b7c3', gold:'#c9a227' },
    boxShadow:{ soft:'0 8px 24px rgba(0,0,0,0.18)' },
    fontFamily:{ display:['Cinzel','serif'], ui:['Inter','system-ui','sans-serif'] }
  }},
  plugins: []
} satisfies Config
