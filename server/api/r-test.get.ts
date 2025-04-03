import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'
import path from 'path'
import * as R from 'r-integration'

export default defineEventHandler(async (event) => {
  try {
    // Use R integration directly

    // Path to the test R script
    const scriptPath = path.resolve(process.cwd(), 'server/r-scripts/test.R')

    // Execute the R script
    // Note: The async version is not available, so we'll use the synchronous version
    const result = R.executeRScript(scriptPath)

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
