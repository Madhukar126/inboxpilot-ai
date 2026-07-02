import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        cloud: "#f5f7fb",
        line: "#dfe5ef"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(23, 32, 51, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
