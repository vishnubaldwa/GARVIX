import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: "#07090e",
          card: "#0d131f",
          border: "#1e293b",
          cyan: "#00f2fe",
          blue: "#38bdf8",
          neon: "#06b6d4",
          purple: "#8b5cf6"
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "cyber-grid": "linear-gradient(to right, rgba(56, 189, 248, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        "cyber-grid-pattern": "32px 32px",
      }
    },
  },
  plugins: [],
};
export default config;
