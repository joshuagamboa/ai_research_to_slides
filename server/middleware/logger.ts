import { defineEventHandler } from 'h3'
import { logRequest, logResponse } from '../../utils/serverLogger'

export default defineEventHandler(async (event) => {
  // Only log API requests
  if (!event.path.startsWith('/api/')) {
    return
  }
  
  // Log the request
  logRequest({
    url: event.path,
    method: event.method,
    body: event.body,
    headers: event.headers
  })
  
  // Record start time
  const startTime = Date.now()
  
  // Continue with the request
  try {
    await event.next()
  } finally {
    // Calculate response time
    const responseTime = Date.now() - startTime
    
    // Log the response
    logResponse({
      url: event.path,
      method: event.method
    }, {
      statusCode: event.node.res.statusCode,
      body: event.node.res.body
    }, responseTime)
  }
})
