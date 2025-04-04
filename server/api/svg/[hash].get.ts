import { defineEventHandler, getRouterParam } from 'h3'
import { getSvgByHash } from '~/utils/svgStorage'
import { logSvgOperation } from '~/utils/serverLogger'

export default defineEventHandler(async (event) => {
  const hash = getRouterParam(event, 'hash')
  
  if (!hash) {
    return {
      error: 'No SVG hash provided'
    }
  }
  
  const svgContent = getSvgByHash(hash)
  
  if (!svgContent) {
    logSvgOperation('api_get_not_found', { hash })
    return {
      error: `SVG with hash ${hash} not found`
    }
  }
  
  logSvgOperation('api_get', { hash })
  
  // Set the content type to SVG
  event.node.res.setHeader('Content-Type', 'image/svg+xml')
  
  return svgContent
})
