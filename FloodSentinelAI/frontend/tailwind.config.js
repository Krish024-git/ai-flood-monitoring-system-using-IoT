export default {
  content: ["./*.html", "./js/**/*.js", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Space Grotesk", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      },
      colors: {
        command: {
          bg: "#07111f",
          panel: "rgba(12, 24, 42, 0.74)",
          border: "rgba(148, 163, 184, 0.18)"
        }
      },
      boxShadow: {
        neon: "0 0 42px rgba(34, 211, 238, 0.22)",
        danger: "0 0 54px rgba(248, 113, 113, 0.35)"
      }
    }
  },
  plugins: []
};
