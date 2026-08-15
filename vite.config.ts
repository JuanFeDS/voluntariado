import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig(({ command }) => ({
  // Solo en build: en dev, exigir el prefijo /voluntariado/ rompe el acceso
  // directo a fundacion.html/damnificado.html (Vite dev server lo exige tal cual).
  base: command === "build" ? "/voluntariado/" : "/",
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
}));
