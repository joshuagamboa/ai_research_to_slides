import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'
import path from 'path'

export default defineEventHandler(async (event) => {
  try {
    // Get the R integration functions from the plugin
    const { $r } = event.context.nuxtApp

    // Path to the test R script
    const scriptPath = path.resolve(process.cwd(), 'server/r-scripts/test.R')

    // Execute the R script
    const result = await $r.runRScript(scriptPath)

    return {
      success: true,
      result
    }
  } catch (error) {
    console.error('Error testing R integration:', error)
    return {
      success: false,
      error: error.message || 'An error occurred while testing R integration'
    }
  }
})
