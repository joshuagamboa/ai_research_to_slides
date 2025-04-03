import { defineEventHandler } from 'h3'

/**
 * Simple test endpoint to verify API functionality
 * This helps diagnose if the server is properly handling requests
 */
export default defineEventHandler(async (event) => {
  console.log('Test API endpoint called')
  const config = useRuntimeConfig()
  
  // Return basic information about the environment
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      apiKeyConfigured: !!config.openrouterApiKey,
      siteUrl: config.public.siteUrl
    },
    message: 'API test endpoint is working correctly'
  }
})