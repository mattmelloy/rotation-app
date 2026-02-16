import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple in-memory rate limiting for serverless functions
// Note: This is per-function-instance, not global. For production, consider using
// Vercel Edge Config, Upstash Redis, or similar distributed storage.

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string; // Custom error message
}

export function createRateLimiter(config: RateLimitConfig) {
  const { windowMs, maxRequests, message = 'Too many requests, please try again later.' } = config;

  return function rateLimit(
    req: VercelRequest,
    res: VercelResponse
  ): { allowed: boolean; remaining: number; resetTime: number } {
    // Get client identifier (IP address or forwarded header)
    const forwarded = req.headers['x-forwarded-for'];
    const ip = Array.isArray(forwarded) 
      ? forwarded[0] 
      : forwarded?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
    
    const key = `${ip}`;
    const now = Date.now();
    
    // Clean up expired entries
    Object.keys(rateLimitStore).forEach(k => {
      if (rateLimitStore[k].resetTime < now) {
        delete rateLimitStore[k];
      }
    });
    
    // Get or create entry
    let entry = rateLimitStore[key];
    
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + windowMs
      };
      rateLimitStore[key] = entry;
    }
    
    entry.count++;
    const remaining = Math.max(0, maxRequests - entry.count);
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000));
    
    return {
      allowed: entry.count <= maxRequests,
      remaining,
      resetTime: entry.resetTime
    };
  };
}

// Pre-configured rate limiters for different endpoints
export const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20, // 20 requests per minute for AI endpoints
  message: 'Too many AI requests. Please wait a moment before trying again.'
});

export const strictRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5, // 5 requests per minute for expensive operations
  message: 'Rate limit exceeded. Please wait before making more requests.'
});