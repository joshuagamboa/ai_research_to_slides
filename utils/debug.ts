/**
 * Debug utility for consistent logging throughout the application
 * Provides context-based logging with different severity levels
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error';
type LogFunction = (message: string, ...args: any[]) => void;

interface Debugger {
  log: LogFunction;
  info: LogFunction;
  warn: LogFunction;
  error: LogFunction;
}

/**
 * Creates a debugger instance with context-specific logging
 * @param context The context name for the logger (e.g., component or module name)
 * @returns A debugger object with various logging methods
 */
export const createDebugger = (context: string): Debugger => {
  const createLogFunction = (level: LogLevel): LogFunction => {
    return (message: string, ...args: any[]) => {
      const timestamp = new Date().toISOString();
      const prefix = `[${timestamp}] [${context}] [${level.toUpperCase()}]`;
      
      if (args.length > 0) {
        console[level](`${prefix} ${message}`, ...args);
      } else {
        console[level](`${prefix} ${message}`);
      }
    };
  };

  return {
    log: createLogFunction('log'),
    info: createLogFunction('info'),
    warn: createLogFunction('warn'),
    error: createLogFunction('error')
  };
};

// Default debugger instance for general use
const debug = createDebugger('app');

export default debug;