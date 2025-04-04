import { defineNitroPlugin } from 'nitropack/runtime'
import * as fs from 'fs'
import * as path from 'path'
import { logSvgOperation } from '../../utils/serverLogger'

export default defineNitroPlugin((nitroApp) => {
  // Initialize logging
  const isDev = process.env.NODE_ENV === 'development'
  
  // Log server startup
  const timestamp = new Date().toISOString()
  const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), 'logs')
  
  // Ensure SVG cache directory exists in public for development mode
  if (isDev) {
    const SVG_DIR = path.join(process.cwd(), 'public', 'svg-cache')
    if (!fs.existsSync(SVG_DIR)) {
      fs.mkdirSync(SVG_DIR, { recursive: true })
    }
    
    logSvgOperation('server_start', {
      mode: 'development',
      svgDirectory: SVG_DIR,
      message: 'SVG files will be retained in development mode'
    })
  } else {
    logSvgOperation('server_start', {
      mode: 'production',
      message: 'SVG files will be stored as base64 in production mode'
    })
  }
  
  // Log server shutdown
  nitroApp.hooks.hook('close', () => {
    logSvgOperation('server_shutdown', {
      timestamp: new Date().toISOString(),
      mode: isDev ? 'development' : 'production'
    })
  })
})
