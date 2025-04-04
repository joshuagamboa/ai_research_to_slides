import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

// Log file paths
const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), 'logs')
const REQUEST_LOG = path.join(LOG_DIR, 'server-requests.log')
const RESPONSE_LOG = path.join(LOG_DIR, 'server-responses.log')
const R_RUNTIME_LOG = path.join(LOG_DIR, 'r-runtime.log')
const SVG_OPERATIONS_LOG = path.join(LOG_DIR, 'svg-operations.log')

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true })
}

// Create log files if they don't exist
[REQUEST_LOG, RESPONSE_LOG, R_RUNTIME_LOG, SVG_OPERATIONS_LOG].forEach(logFile => {
  if (!fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, '')
  }
})

// Format log entry with timestamp
const formatLogEntry = (entry: any): string => {
  const timestamp = new Date().toISOString()
  return `[${timestamp}] ${typeof entry === 'string' ? entry : JSON.stringify(entry, null, 2)}\n${'-'.repeat(80)}\n`
}

// Log request
export const logRequest = (req: any) => {
  const { url, method, body } = req
  const entry = {
    url,
    method,
    body: body || {},
    headers: req.headers || {}
  }
  fs.appendFileSync(REQUEST_LOG, formatLogEntry(entry))
}

// Log response
export const logResponse = (req: any, res: any, responseTime: number) => {
  const { url, method } = req
  const entry = {
    url,
    method,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    responseSize: res.body ? Buffer.byteLength(JSON.stringify(res.body)) : 0
  }
  fs.appendFileSync(RESPONSE_LOG, formatLogEntry(entry))
}

// Log R runtime execution
export const logRExecution = (rCode: string, result: any, executionTime: number, error?: any) => {
  const entry = {
    timestamp: new Date().toISOString(),
    executionTime: `${executionTime}ms`,
    rCode: rCode.length > 500 ? `${rCode.substring(0, 500)}...` : rCode,
    result: error ? null : (typeof result === 'string' && result.length > 500 ? `${result.substring(0, 500)}...` : result),
    error: error ? error.message || String(error) : null,
    success: !error
  }
  fs.appendFileSync(R_RUNTIME_LOG, formatLogEntry(entry))
}

// Log R file operations
export const logRFileOperation = (operation: string, filePath: string, success: boolean, error?: any) => {
  const entry = {
    operation,
    filePath,
    success,
    error: error ? error.message || String(error) : null
  }
  fs.appendFileSync(R_RUNTIME_LOG, formatLogEntry(entry))
}

// Log SVG operations
export const logSvgOperation = (operation: string, details: any) => {
  const entry = {
    operation,
    ...details,
    timestamp: new Date().toISOString()
  }
  fs.appendFileSync(SVG_OPERATIONS_LOG, formatLogEntry(entry))
}
