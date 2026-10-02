import type { RequestHandler } from 'express';
export const notFound: RequestHandler = (req, res) =>
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    code: 'ENDPOINT_NOT_FOUND',
  });
export default notFound;
