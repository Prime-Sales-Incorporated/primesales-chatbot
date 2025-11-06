// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        opensans: ["Open Sans", "sans-serif"],
        henn: ['"Henny Penny"', "system-ui"], // name "henn" for easy use
        iris: ['"Irish Grover"', "system-ui"], // name "henn" for easy use
      },
      keyframes: {
        "bounce-small": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "spin-half": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(60deg)" },
        },
        "rotate-once": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(30%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "spin-twice": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(1080deg)" },
        },
        slideUp: {
          "0%, 20%": { transform: "translateY(100%)", opacity: 0 },
          "10%, 30%": { transform: "translateY(0%)", opacity: 1 },
          "40%, 100%": { transform: "translateY(-100%)", opacity: 0 },
        },
        // New from your code:
        move: {
          "25%": { transform: "translateY(-5.8vmin)", opacity: "1" },
          "50%": { transform: "translateY(-11vmin)" },
          "75%": { transform: "translateY(-16.5vmin)" },
        },
        "white-out": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        greetings1: {
          "0%, 20%": { opacity: 1, transform: "translateY(0)" },
          "30%, 100%": { opacity: 0, transform: "translateY(-20px)" },
        },
        greetings2: {
          "0%, 25%": { opacity: 0, transform: "translateY(20px)" },
          "30%, 50%": { opacity: 1, transform: "translateY(0)" },
          "55%, 100%": { opacity: 0, transform: "translateY(-20px)" },
        },
        greetings3: {
          "0%, 50%": { opacity: 0, transform: "translateY(20px)" },
          "55%, 75%": { opacity: 1, transform: "translateY(0)" },
          "80%, 100%": { opacity: 0, transform: "translateY(-20px)" },
        },
        greetings4: {
          "0%, 75%": { opacity: 0, transform: "translateY(20px)" },
          "80%, 95%": { opacity: 1, transform: "translateY(0)" },
          "100%": { opacity: 0, transform: "translateY(-20px)" },
        },
        wave: {
          "0%, 80%, 100%": { transform: "scale(0)" },
          "40%": { transform: "scale(1)" },
        },
        "bounce-fade": {
          "0%, 80%, 100%": { transform: "translateY(0)", opacity: "0.3" },
          "40%": { transform: "translateY(-4px)", opacity: "1" },
        },
      },
      animation: {
        "bounce-small": "bounce-small 0.6s ease infinite",
        "fade-in": "fade-in 0.5s ease forwards",
        "spin-once": "spin 1s linear 1",
        "spin-half-once": "spin-half 0.5s ease forwards",
        "rotate-once": "rotate-once 0.5s ease forwards",
        "slide-in-right": "slide-in-right 2s ease-out forwards",
        "spin-twice": "spin-twice 1s ease-in-out forwards",
        greetings: "greetings 12s linear infinite", // linear keeps timing exact
        greetings1: "greetings1 8s ease-in-out infinite",
        greetings2: "greetings2 8s ease-in-out infinite",
        greetings3: "greetings3 8s ease-in-out infinite",
        greetings4: "greetings4 8s ease-in-out infinite",
        wave: "wave 1.4s infinite ease-in-out both",
        "bounce-fade": "bounce-fade 1.4s infinite ease-in-out both",
        // Custom animations from your code
        move: "move 4s infinite",
        "white-out": "white-out 5s infinite",
      },
    },
  },
  plugins: [],
};
