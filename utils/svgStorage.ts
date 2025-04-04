import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import * as crypto from 'crypto'
import { logSvgOperation } from './serverLogger'

// SVG storage configuration
const isDev = process.env.NODE_ENV === 'development'
const SVG_DIR = isDev 
  ? path.join(process.cwd(), 'public', 'svg-cache')
  : path.join(os.tmpdir(), 'svg-cache')

// Ensure SVG directory exists
if (!fs.existsSync(SVG_DIR)) {
  fs.mkdirSync(SVG_DIR, { recursive: true })
  logSvgOperation('create_directory', { 
    directory: SVG_DIR, 
    mode: isDev ? 'development' : 'production' 
  })
}

/**
 * Save SVG content to a file
 * @param svgContent The SVG content to save
 * @param metadata Optional metadata about the SVG
 * @returns The file path and URL of the saved SVG
 */
export const saveSvgToFile = (svgContent: string, metadata: any = {}): { filePath: string, url: string } => {
  try {
    // Generate a unique filename
    const hash = crypto.createHash('md5').update(svgContent).digest('hex')
    const filename = `svg-${hash}-${Date.now()}.svg`
    const filePath = path.join(SVG_DIR, filename)
    
    // Save the SVG content to a file
    fs.writeFileSync(filePath, svgContent)
    
    // Generate a URL for the SVG
    const url = isDev 
      ? `/svg-cache/${filename}` // In development, serve from public directory
      : `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}` // In production, use base64
    
    // Log the operation
    logSvgOperation('save', { 
      filePath, 
      url, 
      size: svgContent.length,
      hash,
      mode: isDev ? 'development' : 'production',
      metadata
    })
    
    return { filePath, url }
  } catch (error) {
    // Log the error
    logSvgOperation('save_error', { 
      error: error.message || String(error),
      mode: isDev ? 'development' : 'production',
      metadata
    })
    
    // Return a fallback
    return { 
      filePath: '', 
      url: '' 
    }
  }
}

/**
 * Get an SVG file by its hash
 * @param hash The hash of the SVG content
 * @returns The SVG content or null if not found
 */
export const getSvgByHash = (hash: string): string | null => {
  try {
    // Find the SVG file by hash
    const files = fs.readdirSync(SVG_DIR)
    const svgFile = files.find(file => file.includes(`svg-${hash}`))
    
    if (!svgFile) {
      logSvgOperation('get_not_found', { hash })
      return null
    }
    
    // Read the SVG content
    const filePath = path.join(SVG_DIR, svgFile)
    const svgContent = fs.readFileSync(filePath, 'utf8')
    
    // Log the operation
    logSvgOperation('get', { 
      filePath, 
      hash,
      size: svgContent.length,
      mode: isDev ? 'development' : 'production'
    })
    
    return svgContent
  } catch (error) {
    // Log the error
    logSvgOperation('get_error', { 
      error: error.message || String(error),
      hash,
      mode: isDev ? 'development' : 'production'
    })
    
    return null
  }
}

/**
 * Clean up old SVG files
 * @param maxAge Maximum age of SVG files in milliseconds (default: 24 hours)
 */
export const cleanupSvgFiles = (maxAge: number = 24 * 60 * 60 * 1000): void => {
  try {
    // Only clean up in production mode
    if (isDev) {
      logSvgOperation('cleanup_skipped', { 
        reason: 'Development mode - SVG files are preserved',
        mode: 'development'
      })
      return
    }
    
    const now = Date.now()
    const files = fs.readdirSync(SVG_DIR)
    let deletedCount = 0
    
    files.forEach(file => {
      if (!file.startsWith('svg-')) return
      
      const filePath = path.join(SVG_DIR, file)
      const stats = fs.statSync(filePath)
      const fileAge = now - stats.mtimeMs
      
      if (fileAge > maxAge) {
        fs.unlinkSync(filePath)
        deletedCount++
      }
    })
    
    // Log the operation
    logSvgOperation('cleanup', { 
      deletedCount,
      totalFiles: files.length,
      maxAge: `${maxAge / (60 * 60 * 1000)} hours`,
      mode: 'production'
    })
  } catch (error) {
    // Log the error
    logSvgOperation('cleanup_error', { 
      error: error.message || String(error),
      mode: isDev ? 'development' : 'production'
    })
  }
}

// Schedule periodic cleanup in production
if (!isDev) {
  // Clean up SVG files every 6 hours
  setInterval(() => {
    cleanupSvgFiles()
  }, 6 * 60 * 60 * 1000)
  
  // Initial cleanup on startup
  cleanupSvgFiles()
}
