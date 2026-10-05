import status from 'http-status';
import catchAsync from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { MaintenanceService } from './maintenance.service.js';
export const MaintenanceController = {
  list: catchAsync(async (_req, res) =>
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: 'Maintenance schedules retrieved',
      data: await MaintenanceService.list(),
    }),
  ),
  create: catchAsync(async (req, res) =>
    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: 'Maintenance scheduled',
      data: await MaintenanceService.create(req.body),
    }),
  ),
  remove: catchAsync(async (req, res) => {
    await MaintenanceService.remove(String(req.params.id));
    return sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: 'Maintenance removed',
    });
  }),
};
