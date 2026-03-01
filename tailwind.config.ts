import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          950: "#052e16",
          900: "#064e3b",
          800: "#065f46",
          700: "#047857",
          600: "#059669"
        }
      }
    }
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
