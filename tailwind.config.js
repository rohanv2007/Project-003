/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // FixMyCampus editorial system, deep teal accent for Nivarana
        paper: "#f4f1e8",
        cream: "#fcfaf3",
        sand: "#e9e2cf",
        line: "#d8cdb2",
        ink: "#1c1a14",
        soot: "#55503f",
        faint: "#7d7460",
        signal: "#0f6f6a",
        tide: "#0a4f4b",
        moss: "#2f6e4e",
        gold: "#96690a",
        alarm: "#b3261e",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-grotesk)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
