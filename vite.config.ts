import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig(() => ({
  // Dominio propio (pegaungrito.com) sirve la app desde la raíz.
  base: "/",
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
        admin: path.resolve(__dirname, "admin.html"),
      },
    },
  },
}));
