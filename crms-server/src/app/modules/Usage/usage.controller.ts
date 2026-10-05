import status from 'http-status';
import catchAsync from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { UsageService } from './usage.service.js';
export const UsageController = {
  list: catchAsync(async (_req, res) =>
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: 'Usage logs retrieved',
      data: await UsageService.list(
        res.locals.user.id,
        res.locals.user.companyId,
        res.locals.user.role,
      ),
    }),
  ),
};
