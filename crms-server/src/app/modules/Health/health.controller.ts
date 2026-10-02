import status from 'http-status';
import catchAsync from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';

const healthCheck = catchAsync(async (_req, res) => {
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'CRMS API is healthy',
    data: { service: 'crms-server', timestamp: new Date().toISOString() },
  });
});

export const HealthController = {
  healthCheck,
};
