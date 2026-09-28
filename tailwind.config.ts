import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: { outfit: ['Outfit','sans-serif'] },
      colors: {
        navy: { DEFAULT:'#0F1629' },
        surface: { DEFAULT:'#151D35', 2:'#1E2A47' },
      },
    },
  },
  plugins: [],
}
export default config
