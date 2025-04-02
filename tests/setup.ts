import { afterAll, afterEach, beforeAll } from 'vitest'
import { config } from '@vue/test-utils'

// Set up global Vue test configuration
config.global.mocks = {
  // Mock Nuxt's global properties and composables
  $nuxt: {
    $config: {
      public: {
        siteUrl: 'http://localhost:3000'
      }
    }
  },
  defineNuxtPlugin: () => {},
  useRuntimeConfig: () => ({
    public: {
      siteUrl: 'http://localhost:3000'
    }
  })
}

// Mock environment variables
process.env.OPENROUTER_API_KEY = 'test-api-key'
process.env.NUXT_PUBLIC_SITE_URL = 'http://localhost:3000'

// Clean up after tests
afterEach(() => {
  // Reset any mocks or state between tests
})