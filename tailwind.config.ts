import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1A1A1A",
        cream: "#FFFFFF",
        sand: "#F2F0ED",
        bone: "#E9E5DE",
        clay: "#A67C52",
        sage: "#7C8A6B"
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"]
      },
      maxWidth: {
        content: "1200px",
        narrow: "960px"
      },
      letterSpacing: {
        widest: "0.28em"
      }
    }
  },
  plugins: []
};

export default config;
