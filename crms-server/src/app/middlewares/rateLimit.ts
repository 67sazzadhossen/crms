import type { RequestHandler } from 'express';
const hits = new Map<string, { count: number; reset: number }>();
export const rateLimit =
  (windowMs = 60_000, max = 120): RequestHandler =>
  (req, res, next) => {
    const key = req.ip ?? 'unknown';
    const now = Date.now();
    const current = hits.get(key);
    if (!current || current.reset < now) hits.set(key, { count: 1, reset: now + windowMs });
    else {
      current.count += 1;
      if (current.count > max) {
        res
          .status(429)
          .json({ success: false, message: 'Too many requests. Please try again later.' });
        return;
      }
    }
    next();
  };
