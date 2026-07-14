import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // ⚠️ Doit correspondre au nom de ton repo GitHub pour que GitHub Pages
  // trouve les fichiers (https://<user>.github.io/sporty-store/).
  // Si tu déploies sur Vercel/Netlify plutôt que GitHub Pages, remplace par "/".
  base: "/sporty-store/",
});
