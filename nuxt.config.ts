// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@nuxt/content',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/test-utils'
  ],

  // Runtime config for environment variables
  runtimeConfig: {
    // Server-side environment variables
    openrouterApiKey: process.env.OPENROUTER_API_KEY,
    
    // Public variables that are exposed to the client
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  }
})