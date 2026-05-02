/**
 * Production-safe logging utility
 * Only logs in development mode, suppresses in production
 */

// Check for development environment
// In Vite frontend: import.meta.env.DEV
// In Node.js API: process.env.NODE_ENV
const isDevelopment = typeof import.meta !== 'undefined' 
  ? (import.meta as any).env?.DEV 
  : process.env.NODE_ENV !== 'production';

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  error: (...args: any[]) => {
    // Always log errors, but consider using error tracking service in production
    console.error(...args);
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
  
  // For tracking errors in production (e.g., Sentry, LogRocket, etc.)
  // This is a placeholder - integrate with your error tracking service
  trackError: (error: Error, context?: Record<string, any>) => {
    console.error('[Error Tracking]', error, context);
    // In production, send to error tracking service:
    // Sentry.captureException(error, { extra: context });
  }
};

export default logger;
