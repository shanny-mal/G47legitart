// tailwind.config.js
module.exports = {
  darkMode: "class", // <-- important
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        karibaNavy: "#08293B",
        karibaCoral: "#FF6B6B",
        karibaSand: "#F7E9D7",
        karibaTeal: "#19A7CE",
      },
    },
  },
  plugins: [],
};
