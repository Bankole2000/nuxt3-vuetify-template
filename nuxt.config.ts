import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ["@pinia/nuxt", "@vueuse/nuxt", "@vite-pwa/nuxt", "@tresjs/nuxt"],

  runtimeConfig: {
    public: {
      apiBaseUrl:
        process.env.NUXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001",
      wsUrl: process.env.NUXT_PUBLIC_WS_URL ?? "http://localhost:3001",
      isDev: process.env.NODE_ENV !== "production",
      linkPreviewKey: process.env.NUXT_PUBLIC_JSON_IO_LINK_PREVIEW_API_KEY,
    },
  },

  // PWA — installable, offline-capable
  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: "My App",
      short_name: "MyApp",
      description: "A Nuxt 3 + Vuetify 4 starter template.",
      theme_color: "#1976D2",
      background_color: "#ffffff",
      display: "standalone",
      icons: [
        { src: "/icons/pwa-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "/icons/pwa-512x512.png", sizes: "512x512", type: "image/png" },
        {
          src: "/icons/pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    workbox: {
      // Cache app shell + Vuetify assets
      globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      navigateFallback: "/",
      navigateFallbackDenylist: [/^\/api\//],
      runtimeCaching: [
        {
          // Cache API responses for 5 minutes
          urlPattern: /^https?:\/\/.*\/api\/.*/i,
          handler: "NetworkFirst",
          options: {
            cacheName: "api-cache",
            expiration: { maxEntries: 50, maxAgeSeconds: 300 },
            networkTimeoutSeconds: 10,
          },
        },
        {
          // Cache images for 30 days
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
          handler: "CacheFirst",
          options: {
            cacheName: "image-cache",
            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
          },
        },
      ],
    },
    // Only register SW in production — avoids cache confusion in dev
    devOptions: {
      enabled: false,
    },
  },

  build: {
    transpile: ["vuetify"],
  },

  css: ["vuetify/styles"],

  vite: {
    plugins: [vuetify({ autoImport: true })],
    optimizeDeps: {
      include: ["@vue/devtools-core", "@vue/devtools-kit"],
    },
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
});
