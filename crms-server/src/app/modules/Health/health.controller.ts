import type { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';

export const healthController = catchAsync((_req: Request, res: Response) => {
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'CRMS API is healthy',
    data: { service: 'crms-server', timestamp: new Date().toISOString() },
  });
});
