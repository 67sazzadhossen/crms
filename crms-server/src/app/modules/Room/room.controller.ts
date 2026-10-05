import status from 'http-status';
import catchAsync from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { RoomService } from './room.service.js';
export const RoomController = {
  list: catchAsync(async (_req, res) =>
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: 'Rooms retrieved',
      data: await RoomService.list(),
    }),
  ),
  create: catchAsync(async (req, res) =>
    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: 'Room created',
      data: await RoomService.create(req.body),
    }),
  ),
  update: catchAsync(async (req, res) =>
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: 'Room updated',
      data: await RoomService.update(String(req.params.id), req.body),
    }),
  ),
  remove: catchAsync(async (req, res) => {
    await RoomService.remove(String(req.params.id));
    return sendResponse(res, { statusCode: status.OK, success: true, message: 'Room deleted' });
  }),
};
