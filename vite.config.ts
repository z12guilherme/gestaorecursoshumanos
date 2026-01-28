import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  server: {
    port: 8080,
  },
  // 1. Added build configuration for code splitting
  build: {
    // Increases the warning limit so Vite doesn't complain about the vendor file
    chunkSizeWarningLimit: 3000, 
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Creates a separate 'vendor' chunk for third-party packages
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // 2. Added workbox configuration to increase file size limit
      workbox: {
        maximumFileSizeToCacheInBytes: 3000000, // Increased to 3MB
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'GestãoRH',
        short_name: 'GestãoRH',
        description: 'Sistema de Gestão de Recursos Humanos',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          // Android
          {
            src: '/android/android-launchericon-512-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/android/android-launchericon-192-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/android/android-launchericon-144-144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: '/android/android-launchericon-96-96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: '/android/android-launchericon-72-72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: '/android/android-launchericon-48-48.png',
            sizes: '48x48',
            type: 'image/png'
          },
          // iOS
          {
            src: '/ios/1024.png',
            sizes: '1024x1024',
            type: 'image/png'
          },
          {
            src: '/ios/512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/ios/256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: '/ios/192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/ios/180.png',
            sizes: '180x180',
            type: 'image/png'
          },
          {
            src: '/ios/167.png',
            sizes: '167x167',
            type: 'image/png'
          },
          {
            src: '/ios/152.png',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: '/ios/144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: '/ios/128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: '/ios/120.png',
            sizes: '120x120',
            type: 'image/png'
          },
          {
            src: '/ios/114.png',
            sizes: '114x114',
            type: 'image/png'
          },
          {
            src: '/ios/100.png',
            sizes: '100x100',
            type: 'image/png'
          },
          {
            src: '/ios/87.png',
            sizes: '87x87',
            type: 'image/png'
          },
          {
            src: '/ios/80.png',
            sizes: '80x80',
            type: 'image/png'
          },
          {
            src: '/ios/76.png',
            sizes: '76x76',
            type: 'image/png'
          },
          {
            src: '/ios/72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: '/ios/64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: '/ios/60.png',
            sizes: '60x60',
            type: 'image/png'
          },
          {
            src: '/ios/58.png',
            sizes: '58x58',
            type: 'image/png'
          },
          {
            src: '/ios/57.png',
            sizes: '57x57',
            type: 'image/png'
          },
          {
            src: '/ios/50.png',
            sizes: '50x50',
            type: 'image/png'
          },
          {
            src: '/ios/40.png',
            sizes: '40x40',
            type: 'image/png'
          },
          {
            src: '/ios/32.png',
            sizes: '32x32',
            type: 'image/png'
          },
          {
            src: '/ios/29.png',
            sizes: '29x29',
            type: 'image/png'
          },
          {
            src: '/ios/20.png',
            sizes: '20x20',
            type: 'image/png'
          },
          {
            src: '/ios/16.png',
            sizes: '16x16',
            type: 'image/png'
          },
          // Windows 11 (Principais)
          {
            src: '/windows11/LargeTile.scale-400.png',
            sizes: '1240x1240',
            type: 'image/png'
          },
          {
            src: '/windows11/Square44x44Logo.scale-400.png',
            sizes: '176x176',
            type: 'image/png'
          },
          {
            src: '/windows11/Square150x150Logo.scale-400.png',
            sizes: '600x600',
            type: 'image/png'
          },
          {
            src: '/windows11/Square44x44Logo.targetsize-256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: '/windows11/StoreLogo.scale-400.png',
            sizes: '200x200',
            type: 'image/png'
          },
          {
            src: '/windows11/SplashScreen.scale-400.png',
            sizes: '2480x1200',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})