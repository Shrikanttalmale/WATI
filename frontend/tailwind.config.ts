import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#10b981",
        secondary: "#3b82f6",
      },
    },
  },
  plugins: [],
}

export default config
