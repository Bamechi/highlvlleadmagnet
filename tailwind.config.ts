import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Construct palette, blue variant
        "construct-base": "#eef3fb",   // pale blue page base
        "construct-accent": "#0f56c4", // primary blue
        "construct-signal": "#00c8ff", // signal cyan
        "construct-ink": "#0a1628",    // near-black navy
      },
      fontFamily: {
        display: ["var(--font-archivo-black)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
