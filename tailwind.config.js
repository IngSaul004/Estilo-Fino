/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#151922",       // fondo modo oscuro
        ivory: "#F5F1E8",     // fondo modo claro
        pole: {
          red: "#B3272D",     // rojo poste de barbería
          blue: "#1E3A5F",    // azul poste de barbería
        },
        gold: "#C9A227",      // acento dorado (ganancia)
        chrome: "#8B93A1",    // gris secundario
        charcoal: "#20242F",  // tarjetas modo oscuro
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      backgroundImage: {
        "barber-stripe":
          "repeating-linear-gradient(135deg, var(--stripe-a) 0px, var(--stripe-a) 10px, var(--stripe-b) 10px, var(--stripe-b) 20px, var(--stripe-c) 20px, var(--stripe-c) 30px)",
      },
    },
  },
  plugins: [],
};
