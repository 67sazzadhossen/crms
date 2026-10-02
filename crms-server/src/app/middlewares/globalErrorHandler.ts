import type { ErrorRequestHandler } from 'express';
import ApiError from '../errors/ApiError.js';
const globalErrorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const statusCode = error instanceof ApiError ? error.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: error instanceof Error ? error.message : 'Something went wrong',
    code: error instanceof ApiError ? error.code : 'INTERNAL_ERROR',
  });
};
export default globalErrorHandler;
