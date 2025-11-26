import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cloud: "#FAFAFA",
        sandstone: "#F3EDE4",
        midnight: "#0F172A",
        mint: "#2AD5C1",
        apricot: "#FFBCA9",
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "pill": "9999px",
      },
      boxShadow: {
        "float": "0 20px 40px -12px rgba(15, 23, 42, 0.1)",
        "glow": "0 0 20px rgba(42, 213, 193, 0.3)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;


