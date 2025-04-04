import { defineEventHandler } from 'h3'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { logSvgOperation } from '~/utils/serverLogger'

export default defineEventHandler(async (event) => {
  try {
    const isDev = process.env.NODE_ENV === 'development'
    const SVG_DIR = isDev 
      ? path.join(process.cwd(), 'public', 'svg-cache')
      : path.join(os.tmpdir(), 'svg-cache')
    
    if (!fs.existsSync(SVG_DIR)) {
      return {
        files: [],
        count: 0,
        directory: SVG_DIR
      }
    }
    
    const files = fs.readdirSync(SVG_DIR)
      .filter(file => file.endsWith('.svg'))
      .map(file => {
        const filePath = path.join(SVG_DIR, file)
        const stats = fs.statSync(filePath)
        const hash = file.split('-')[1] // Extract hash from filename
        
        return {
          name: file,
          path: filePath,
          url: isDev ? `/svg-cache/${file}` : `/api/svg/${hash}`,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          hash
        }
      })
      .sort((a, b) => b.created.getTime() - a.created.getTime()) // Sort by creation time, newest first
    
    logSvgOperation('list_files', {
      count: files.length,
      directory: SVG_DIR,
      mode: isDev ? 'development' : 'production'
    })
    
    return {
      files,
      count: files.length,
      directory: SVG_DIR
    }
  } catch (error) {
    logSvgOperation('list_files_error', {
      error: error.message || String(error)
    })
    
    return {
      error: `Error listing SVG files: ${error.message}`,
      files: []
    }
  }
})
