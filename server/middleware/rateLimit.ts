import type { RequestHandler } from 'express';
import { env } from '../config/env.ts';
import { consumeRateLimit } from '../lib/rateLimit.ts';

export function createRateLimit(scope: string, max: number, windowMs: number): RequestHandler {
  return (req, res, next) => {
    const result = consumeRateLimit(req, scope, max, windowMs);

    if (!result.allowed) {
      res.setHeader('Retry-After', String(result.retryAfterSec));
      res.status(429).json({
        success: false,
        error: 'Too many requests. Please wait and try again.',
      });
      return;
    }

    next();
  };
}

export const loginRateLimit = createRateLimit(
  'login',
  env.rateLimitLoginMax,
  env.rateLimitLoginWindowMs,
);
