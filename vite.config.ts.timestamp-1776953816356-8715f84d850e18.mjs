// vite.config.ts
import path from "path";
import { defineConfig } from "file:///C:/Users/santa%20fe/Desktop/gestaorecursoshumanos/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/santa%20fe/Desktop/gestaorecursoshumanos/node_modules/@vitejs/plugin-react-swc/index.js";
import { VitePWA } from "file:///C:/Users/santa%20fe/Desktop/gestaorecursoshumanos/node_modules/vite-plugin-pwa/dist/index.js";
import { visualizer } from "file:///C:/Users/santa%20fe/Desktop/gestaorecursoshumanos/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
var __vite_injected_original_dirname = "C:\\Users\\santa fe\\Desktop\\gestaorecursoshumanos";
var vite_config_default = defineConfig({
  server: {
    port: 8080
  },
  // 1. Added build configuration for code splitting
  build: {
    // Increases the warning limit so Vite doesn't complain about the vendor file
    chunkSizeWarningLimit: 3e3,
    rollupOptions: {
      external: ["dompurify"],
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("recharts")) return "recharts";
            if (id.includes("jspdf")) return "jspdf";
            if (id.includes("xlsx")) return "xlsx";
            if (id.includes("@supabase")) return "supabase";
            if (id.includes("lucide-react")) return "lucide";
            if (id.includes("date-fns")) return "date-fns";
            return "vendor";
          }
        }
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // 2. Added workbox configuration to increase file size limit
      workbox: {
        maximumFileSizeToCacheInBytes: 3e6,
        // Increased to 3MB
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"]
      },
      manifest: {
        name: "Gest\xE3oRH",
        short_name: "Gest\xE3oRH",
        description: "Sistema de Gest\xE3o de Recursos Humanos",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        orientation: "portrait",
        icons: [
          // Android
          {
            src: "/android/android-launchericon-512-512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "/android/android-launchericon-192-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/android/android-launchericon-144-144.png",
            sizes: "144x144",
            type: "image/png"
          },
          {
            src: "/android/android-launchericon-96-96.png",
            sizes: "96x96",
            type: "image/png"
          },
          {
            src: "/android/android-launchericon-72-72.png",
            sizes: "72x72",
            type: "image/png"
          },
          {
            src: "/android/android-launchericon-48-48.png",
            sizes: "48x48",
            type: "image/png"
          },
          // iOS
          {
            src: "/ios/1024.png",
            sizes: "1024x1024",
            type: "image/png"
          },
          {
            src: "/ios/512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "/ios/256.png",
            sizes: "256x256",
            type: "image/png"
          },
          {
            src: "/ios/192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/ios/180.png",
            sizes: "180x180",
            type: "image/png"
          },
          {
            src: "/ios/167.png",
            sizes: "167x167",
            type: "image/png"
          },
          {
            src: "/ios/152.png",
            sizes: "152x152",
            type: "image/png"
          },
          {
            src: "/ios/144.png",
            sizes: "144x144",
            type: "image/png"
          },
          {
            src: "/ios/128.png",
            sizes: "128x128",
            type: "image/png"
          },
          {
            src: "/ios/120.png",
            sizes: "120x120",
            type: "image/png"
          },
          {
            src: "/ios/114.png",
            sizes: "114x114",
            type: "image/png"
          },
          {
            src: "/ios/100.png",
            sizes: "100x100",
            type: "image/png"
          },
          {
            src: "/ios/87.png",
            sizes: "87x87",
            type: "image/png"
          },
          {
            src: "/ios/80.png",
            sizes: "80x80",
            type: "image/png"
          },
          {
            src: "/ios/76.png",
            sizes: "76x76",
            type: "image/png"
          },
          {
            src: "/ios/72.png",
            sizes: "72x72",
            type: "image/png"
          },
          {
            src: "/ios/64.png",
            sizes: "64x64",
            type: "image/png"
          },
          {
            src: "/ios/60.png",
            sizes: "60x60",
            type: "image/png"
          },
          {
            src: "/ios/58.png",
            sizes: "58x58",
            type: "image/png"
          },
          {
            src: "/ios/57.png",
            sizes: "57x57",
            type: "image/png"
          },
          {
            src: "/ios/50.png",
            sizes: "50x50",
            type: "image/png"
          },
          {
            src: "/ios/40.png",
            sizes: "40x40",
            type: "image/png"
          },
          {
            src: "/ios/32.png",
            sizes: "32x32",
            type: "image/png"
          },
          {
            src: "/ios/29.png",
            sizes: "29x29",
            type: "image/png"
          },
          {
            src: "/ios/20.png",
            sizes: "20x20",
            type: "image/png"
          },
          {
            src: "/ios/16.png",
            sizes: "16x16",
            type: "image/png"
          },
          // Windows 11 (Principais)
          {
            src: "/windows11/LargeTile.scale-400.png",
            sizes: "1240x1240",
            type: "image/png"
          },
          {
            src: "/windows11/Square44x44Logo.scale-400.png",
            sizes: "176x176",
            type: "image/png"
          },
          {
            src: "/windows11/Square150x150Logo.scale-400.png",
            sizes: "600x600",
            type: "image/png"
          },
          {
            src: "/windows11/Square44x44Logo.targetsize-256.png",
            sizes: "256x256",
            type: "image/png"
          },
          {
            src: "/windows11/StoreLogo.scale-400.png",
            sizes: "200x200",
            type: "image/png"
          },
          {
            src: "/windows11/SplashScreen.scale-400.png",
            sizes: "2480x1200",
            type: "image/png"
          }
        ]
      }
    }),
    visualizer({
      open: true,
      // Abre o navegador automaticamente após o build
      gzipSize: true,
      brotliSize: true,
      filename: "stats.html"
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  optimizeDeps: {
    exclude: ["dompurify"]
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxzYW50YSBmZVxcXFxEZXNrdG9wXFxcXGdlc3Rhb3JlY3Vyc29zaHVtYW5vc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcc2FudGEgZmVcXFxcRGVza3RvcFxcXFxnZXN0YW9yZWN1cnNvc2h1bWFub3NcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3NhbnRhJTIwZmUvRGVza3RvcC9nZXN0YW9yZWN1cnNvc2h1bWFub3Mvdml0ZS5jb25maWcudHNcIjsvLy8gPHJlZmVyZW5jZSB0eXBlcz1cInZpdGVzdFwiIC8+XHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCJcclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIlxyXG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiXHJcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tIFwidml0ZS1wbHVnaW4tcHdhXCJcclxuaW1wb3J0IHsgdmlzdWFsaXplciB9IGZyb20gXCJyb2xsdXAtcGx1Z2luLXZpc3VhbGl6ZXJcIlxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBzZXJ2ZXI6IHtcclxuICAgIHBvcnQ6IDgwODAsXHJcbiAgfSxcclxuICAvLyAxLiBBZGRlZCBidWlsZCBjb25maWd1cmF0aW9uIGZvciBjb2RlIHNwbGl0dGluZ1xyXG4gIGJ1aWxkOiB7XHJcbiAgICAvLyBJbmNyZWFzZXMgdGhlIHdhcm5pbmcgbGltaXQgc28gVml0ZSBkb2Vzbid0IGNvbXBsYWluIGFib3V0IHRoZSB2ZW5kb3IgZmlsZVxyXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAzMDAwLFxyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBleHRlcm5hbDogW1wiZG9tcHVyaWZ5XCJdLFxyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICBtYW51YWxDaHVua3MoaWQpIHtcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcclxuICAgICAgICAgICAgLy8gU2VwYXJhIGJpYmxpb3RlY2FzIGdyYW5kZXMgZW0gY2h1bmtzIGluZGl2aWR1YWlzXHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygncmVjaGFydHMnKSkgcmV0dXJuICdyZWNoYXJ0cyc7XHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnanNwZGYnKSkgcmV0dXJuICdqc3BkZic7XHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygneGxzeCcpKSByZXR1cm4gJ3hsc3gnO1xyXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ0BzdXBhYmFzZScpKSByZXR1cm4gJ3N1cGFiYXNlJztcclxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdsdWNpZGUtcmVhY3QnKSkgcmV0dXJuICdsdWNpZGUnO1xyXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2RhdGUtZm5zJykpIHJldHVybiAnZGF0ZS1mbnMnO1xyXG5cclxuICAgICAgICAgICAgLy8gTyByZXN0YW50ZSB2YWkgcGFyYSBvIHZlbmRvciBwYWRyXHUwMEUzb1xyXG4gICAgICAgICAgICByZXR1cm4gJ3ZlbmRvcic7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBwbHVnaW5zOiBbXHJcbiAgICByZWFjdCgpLFxyXG4gICAgVml0ZVBXQSh7XHJcbiAgICAgIHJlZ2lzdGVyVHlwZTogJ2F1dG9VcGRhdGUnLFxyXG4gICAgICAvLyAyLiBBZGRlZCB3b3JrYm94IGNvbmZpZ3VyYXRpb24gdG8gaW5jcmVhc2UgZmlsZSBzaXplIGxpbWl0XHJcbiAgICAgIHdvcmtib3g6IHtcclxuICAgICAgICBtYXhpbXVtRmlsZVNpemVUb0NhY2hlSW5CeXRlczogMzAwMDAwMCwgLy8gSW5jcmVhc2VkIHRvIDNNQlxyXG4gICAgICAgIGdsb2JQYXR0ZXJuczogWycqKi8qLntqcyxjc3MsaHRtbCxpY28scG5nLHN2Z30nXVxyXG4gICAgICB9LFxyXG4gICAgICBtYW5pZmVzdDoge1xyXG4gICAgICAgIG5hbWU6ICdHZXN0XHUwMEUzb1JIJyxcclxuICAgICAgICBzaG9ydF9uYW1lOiAnR2VzdFx1MDBFM29SSCcsXHJcbiAgICAgICAgZGVzY3JpcHRpb246ICdTaXN0ZW1hIGRlIEdlc3RcdTAwRTNvIGRlIFJlY3Vyc29zIEh1bWFub3MnLFxyXG4gICAgICAgIHRoZW1lX2NvbG9yOiAnI2ZmZmZmZicsXHJcbiAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyNmZmZmZmYnLFxyXG4gICAgICAgIGRpc3BsYXk6ICdzdGFuZGFsb25lJyxcclxuICAgICAgICBzY29wZTogJy8nLFxyXG4gICAgICAgIHN0YXJ0X3VybDogJy8nLFxyXG4gICAgICAgIG9yaWVudGF0aW9uOiAncG9ydHJhaXQnLFxyXG4gICAgICAgIGljb25zOiBbXHJcbiAgICAgICAgICAvLyBBbmRyb2lkXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogJy9hbmRyb2lkL2FuZHJvaWQtbGF1bmNoZXJpY29uLTUxMi01MTIucG5nJyxcclxuICAgICAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcclxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogJy9hbmRyb2lkL2FuZHJvaWQtbGF1bmNoZXJpY29uLTE5Mi0xOTIucG5nJyxcclxuICAgICAgICAgICAgc2l6ZXM6ICcxOTJ4MTkyJyxcclxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogJy9hbmRyb2lkL2FuZHJvaWQtbGF1bmNoZXJpY29uLTE0NC0xNDQucG5nJyxcclxuICAgICAgICAgICAgc2l6ZXM6ICcxNDR4MTQ0JyxcclxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogJy9hbmRyb2lkL2FuZHJvaWQtbGF1bmNoZXJpY29uLTk2LTk2LnBuZycsXHJcbiAgICAgICAgICAgIHNpemVzOiAnOTZ4OTYnLFxyXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJ1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiAnL2FuZHJvaWQvYW5kcm9pZC1sYXVuY2hlcmljb24tNzItNzIucG5nJyxcclxuICAgICAgICAgICAgc2l6ZXM6ICc3Mng3MicsXHJcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6ICcvYW5kcm9pZC9hbmRyb2lkLWxhdW5jaGVyaWNvbi00OC00OC5wbmcnLFxyXG4gICAgICAgICAgICBzaXplczogJzQ4eDQ4JyxcclxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICAvLyBpT1NcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiAnL2lvcy8xMDI0LnBuZycsXHJcbiAgICAgICAgICAgIHNpemVzOiAnMTAyNHgxMDI0JyxcclxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogJy9pb3MvNTEyLnBuZycsXHJcbiAgICAgICAgICAgIHNpemVzOiAnNTEyeDUxMicsXHJcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6ICcvaW9zLzI1Ni5wbmcnLFxyXG4gICAgICAgICAgICBzaXplczogJzI1NngyNTYnLFxyXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJ1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiAnL2lvcy8xOTIucG5nJyxcclxuICAgICAgICAgICAgc2l6ZXM6ICcxOTJ4MTkyJyxcclxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogJy9pb3MvMTgwLnBuZycsXHJcbiAgICAgICAgICAgIHNpemVzOiAnMTgweDE4MCcsXHJcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6ICcvaW9zLzE2Ny5wbmcnLFxyXG4gICAgICAgICAgICBzaXplczogJzE2N3gxNjcnLFxyXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJ1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiAnL2lvcy8xNTIucG5nJyxcclxuICAgICAgICAgICAgc2l6ZXM6ICcxNTJ4MTUyJyxcclxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogJy9pb3MvMTQ0LnBuZycsXHJcbiAgICAgICAgICAgIHNpemVzOiAnMTQ0eDE0NCcsXHJcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6ICcvaW9zLzEyOC5wbmcnLFxyXG4gICAgICAgICAgICBzaXplczogJzEyOHgxMjgnLFxyXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJ1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiAnL2lvcy8xMjAucG5nJyxcclxuICAgICAgICAgICAgc2l6ZXM6ICcxMjB4MTIwJyxcclxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogJy9pb3MvMTE0LnBuZycsXHJcbiAgICAgICAgICAgIHNpemVzOiAnMTE0eDExNCcsXHJcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6ICcvaW9zLzEwMC5wbmcnLFxyXG4gICAgICAgICAgICBzaXplczogJzEwMHgxMDAnLFxyXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJ1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiAnL2lvcy84Ny5wbmcnLFxyXG4gICAgICAgICAgICBzaXplczogJzg3eDg3JyxcclxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogJy9pb3MvODAucG5nJyxcclxuICAgICAgICAgICAgc2l6ZXM6ICc4MHg4MCcsXHJcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6ICcvaW9zLzc2LnBuZycsXHJcbiAgICAgICAgICAgIHNpemVzOiAnNzZ4NzYnLFxyXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJ1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiAnL2lvcy83Mi5wbmcnLFxyXG4gICAgICAgICAgICBzaXplczogJzcyeDcyJyxcclxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogJy9pb3MvNjQucG5nJyxcclxuICAgICAgICAgICAgc2l6ZXM6ICc2NHg2NCcsXHJcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6ICcvaW9zLzYwLnBuZycsXHJcbiAgICAgICAgICAgIHNpemVzOiAnNjB4NjAnLFxyXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJ1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiAnL2lvcy81OC5wbmcnLFxyXG4gICAgICAgICAgICBzaXplczogJzU4eDU4JyxcclxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogJy9pb3MvNTcucG5nJyxcclxuICAgICAgICAgICAgc2l6ZXM6ICc1N3g1NycsXHJcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6ICcvaW9zLzUwLnBuZycsXHJcbiAgICAgICAgICAgIHNpemVzOiAnNTB4NTAnLFxyXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJ1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiAnL2lvcy80MC5wbmcnLFxyXG4gICAgICAgICAgICBzaXplczogJzQweDQwJyxcclxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogJy9pb3MvMzIucG5nJyxcclxuICAgICAgICAgICAgc2l6ZXM6ICczMngzMicsXHJcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6ICcvaW9zLzI5LnBuZycsXHJcbiAgICAgICAgICAgIHNpemVzOiAnMjl4MjknLFxyXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJ1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiAnL2lvcy8yMC5wbmcnLFxyXG4gICAgICAgICAgICBzaXplczogJzIweDIwJyxcclxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogJy9pb3MvMTYucG5nJyxcclxuICAgICAgICAgICAgc2l6ZXM6ICcxNngxNicsXHJcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgLy8gV2luZG93cyAxMSAoUHJpbmNpcGFpcylcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiAnL3dpbmRvd3MxMS9MYXJnZVRpbGUuc2NhbGUtNDAwLnBuZycsXHJcbiAgICAgICAgICAgIHNpemVzOiAnMTI0MHgxMjQwJyxcclxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogJy93aW5kb3dzMTEvU3F1YXJlNDR4NDRMb2dvLnNjYWxlLTQwMC5wbmcnLFxyXG4gICAgICAgICAgICBzaXplczogJzE3NngxNzYnLFxyXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJ1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiAnL3dpbmRvd3MxMS9TcXVhcmUxNTB4MTUwTG9nby5zY2FsZS00MDAucG5nJyxcclxuICAgICAgICAgICAgc2l6ZXM6ICc2MDB4NjAwJyxcclxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogJy93aW5kb3dzMTEvU3F1YXJlNDR4NDRMb2dvLnRhcmdldHNpemUtMjU2LnBuZycsXHJcbiAgICAgICAgICAgIHNpemVzOiAnMjU2eDI1NicsXHJcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6ICcvd2luZG93czExL1N0b3JlTG9nby5zY2FsZS00MDAucG5nJyxcclxuICAgICAgICAgICAgc2l6ZXM6ICcyMDB4MjAwJyxcclxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogJy93aW5kb3dzMTEvU3BsYXNoU2NyZWVuLnNjYWxlLTQwMC5wbmcnLFxyXG4gICAgICAgICAgICBzaXplczogJzI0ODB4MTIwMCcsXHJcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgICB9XHJcbiAgICB9KSxcclxuICAgIHZpc3VhbGl6ZXIoe1xyXG4gICAgICBvcGVuOiB0cnVlLCAvLyBBYnJlIG8gbmF2ZWdhZG9yIGF1dG9tYXRpY2FtZW50ZSBhcFx1MDBGM3MgbyBidWlsZFxyXG4gICAgICBnemlwU2l6ZTogdHJ1ZSxcclxuICAgICAgYnJvdGxpU2l6ZTogdHJ1ZSxcclxuICAgICAgZmlsZW5hbWU6IFwic3RhdHMuaHRtbFwiLFxyXG4gICAgfSksXHJcbiAgXSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBvcHRpbWl6ZURlcHM6IHtcclxuICAgIGV4Y2x1ZGU6IFtcImRvbXB1cmlmeVwiXSxcclxuICB9LFxyXG4gIHRlc3Q6IHtcclxuICAgIGdsb2JhbHM6IHRydWUsXHJcbiAgICBlbnZpcm9ubWVudDogXCJqc2RvbVwiLFxyXG4gICAgc2V0dXBGaWxlczogXCIuL3NyYy90ZXN0L3NldHVwLnRzXCIsXHJcbiAgICBjc3M6IHRydWUsXHJcbiAgfSxcclxufSkiXSwKICAibWFwcGluZ3MiOiAiO0FBQ0EsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sV0FBVztBQUNsQixTQUFTLGVBQWU7QUFDeEIsU0FBUyxrQkFBa0I7QUFMM0IsSUFBTSxtQ0FBbUM7QUFPekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQTtBQUFBLEVBRUEsT0FBTztBQUFBO0FBQUEsSUFFTCx1QkFBdUI7QUFBQSxJQUN2QixlQUFlO0FBQUEsTUFDYixVQUFVLENBQUMsV0FBVztBQUFBLE1BQ3RCLFFBQVE7QUFBQSxRQUNOLGFBQWEsSUFBSTtBQUNmLGNBQUksR0FBRyxTQUFTLGNBQWMsR0FBRztBQUUvQixnQkFBSSxHQUFHLFNBQVMsVUFBVSxFQUFHLFFBQU87QUFDcEMsZ0JBQUksR0FBRyxTQUFTLE9BQU8sRUFBRyxRQUFPO0FBQ2pDLGdCQUFJLEdBQUcsU0FBUyxNQUFNLEVBQUcsUUFBTztBQUNoQyxnQkFBSSxHQUFHLFNBQVMsV0FBVyxFQUFHLFFBQU87QUFDckMsZ0JBQUksR0FBRyxTQUFTLGNBQWMsRUFBRyxRQUFPO0FBQ3hDLGdCQUFJLEdBQUcsU0FBUyxVQUFVLEVBQUcsUUFBTztBQUdwQyxtQkFBTztBQUFBLFVBQ1Q7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsTUFDTixjQUFjO0FBQUE7QUFBQSxNQUVkLFNBQVM7QUFBQSxRQUNQLCtCQUErQjtBQUFBO0FBQUEsUUFDL0IsY0FBYyxDQUFDLGdDQUFnQztBQUFBLE1BQ2pEO0FBQUEsTUFDQSxVQUFVO0FBQUEsUUFDUixNQUFNO0FBQUEsUUFDTixZQUFZO0FBQUEsUUFDWixhQUFhO0FBQUEsUUFDYixhQUFhO0FBQUEsUUFDYixrQkFBa0I7QUFBQSxRQUNsQixTQUFTO0FBQUEsUUFDVCxPQUFPO0FBQUEsUUFDUCxXQUFXO0FBQUEsUUFDWCxhQUFhO0FBQUEsUUFDYixPQUFPO0FBQUE7QUFBQSxVQUVMO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNSO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFVBQ1I7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNSO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFVBQ1I7QUFBQTtBQUFBLFVBRUE7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNSO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFVBQ1I7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNSO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFVBQ1I7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNSO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFVBQ1I7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNSO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFVBQ1I7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNSO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFVBQ1I7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNSO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFVBQ1I7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNSO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFVBQ1I7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNSO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFVBQ1I7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNSO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFVBQ1I7QUFBQTtBQUFBLFVBRUE7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNSO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFVBQ1I7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNSO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFVBQ1I7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDUjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsSUFDRCxXQUFXO0FBQUEsTUFDVCxNQUFNO0FBQUE7QUFBQSxNQUNOLFVBQVU7QUFBQSxNQUNWLFlBQVk7QUFBQSxNQUNaLFVBQVU7QUFBQSxJQUNaLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsV0FBVztBQUFBLEVBQ3ZCO0FBQUEsRUFDQSxNQUFNO0FBQUEsSUFDSixTQUFTO0FBQUEsSUFDVCxhQUFhO0FBQUEsSUFDYixZQUFZO0FBQUEsSUFDWixLQUFLO0FBQUEsRUFDUDtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
