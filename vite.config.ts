import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { nitro } from 'nitro/vite'
import { VitePWA } from 'vite-plugin-pwa'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  plugins: [
    devtools(),
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    tanstackStart(),
    nitro(),
    viteReact(),
    VitePWA({
      injectRegister: false,
      manifestFilename: 'manifest.json',
      outDir: '.output/public',
      registerType: 'autoUpdate',
      includeManifestIcons: false,
      manifest: {
        name: 'ElTrack',
        short_name: 'ElTrack',
        start_url: '.',
        display: 'standalone',
        theme_color: '#da7635',
        background_color: '#f9f9f7',
        icons: [
          {
            src: 'favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon',
          },
          {
            src: 'logo192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: null,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
        runtimeCaching: [],
      },
    }),
  ],
})

export default config
