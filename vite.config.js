import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      workbox: {
        // Precache nur kleine Dateien
        globPatterns: [],
      },
      skipWaiting: true,
      clientsClaim: true,
      devOptions: {
        enabled: true,
      },
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "favicon.svg"],
      manifest: {
        name: "Euro Clicker Game",
        short_name: "EuroClicker",
        description: "A simple clicker game about earning euros.",
        theme_color: "#003399",
        icons: [
          {
            src: "web-app-manifest-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@components": path.resolve(__dirname, "src/components"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@constants": path.resolve(__dirname, "src/constants"),
    },
  },
  build: {
    outDir: "build",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("sonner")) {
              return "sonner";
            }
            if (id.includes("firebase")) {
              return "firebase";
            }
            if (id.includes("lucide-react")) {
              return "lucide";
            }
            if (id.includes("react")) {
              return "react";
            }
            return "vendor";
          }
        },
      },
    },
  },
  server: {
    open: true,
  },
});
