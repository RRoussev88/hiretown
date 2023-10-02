module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "hsl(var(--p) / var(--tw-bg-opacity))",
        "primary-focus": "hsl(var(--pf) / var(--tw-bg-opacity))",
        "primary-content": "hsl(var(--pc) / var(--tw-bg-opacity))",
        "secondary": "hsl(var(--s) / var(--tw-bg-opacity))",
        "secondary-focus": "hsl(var(--sf) / var(--tw-bg-opacity))",
        "secondary-content": "hsl(var(--sc) / var(--tw-bg-opacity))",
        "accent": "hsl(var(--a) / var(--tw-bg-opacity))",
        "accent-focus": "hsl(var(--af) / var(--tw-bg-opacity))",
        "accent-content": "hsl(var(--ac) / var(--tw-bg-opacity))",
        "neutral": "hsl(var(--n) / var(--tw-bg-opacity))",
        "neutral-focus": "hsl(var(--nf) / var(--tw-bg-opacity))",
        "neutral-content": "hsl(var(--nc) / var(--tw-bg-opacity))",
        "base-100": "hsl(var(--b1) / var(--tw-bg-opacity))",
        "base-200": "hsl(var(--b2) / var(--tw-bg-opacity))",
        "base-300": "hsl(var(--b3) / var(--tw-bg-opacity))",
        "base-content": "hsl(var(--bc) / var(--tw-bg-opacity))",
        "info": "hsl(var(--in) / var(--tw-bg-opacity))",
        "success": "hsl(var(--su) / var(--tw-bg-opacity))",
        "warning": "hsl(var(--wa) / var(--tw-bg-opacity))",
        "error": "hsl(var(--er) / var(--tw-bg-opacity))",
      },
    },
  },
};
