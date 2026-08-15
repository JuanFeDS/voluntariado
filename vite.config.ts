import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  // El sitio se publica en GitHub Pages como project page: JuanFeDS.github.io/voluntariado/
  base: "/voluntariado/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        fundacion: path.resolve(__dirname, "fundacion.html"),
        damnificado: path.resolve(__dirname, "damnificado.html"),
      },
    },
  },
});
