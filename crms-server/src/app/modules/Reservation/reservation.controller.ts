import status from 'http-status';
import catchAsync from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { ReservationService } from './reservation.service.js';
import { instantSchema, reservationSchema } from './reservation.validation.js';
export const ReservationController = {
  list: catchAsync(async (_req, res) =>
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: 'Reservations retrieved',
      data: await ReservationService.list(
        res.locals.user.id,
        res.locals.user.companyId,
        res.locals.user.role,
      ),
    }),
  ),
  cancel: catchAsync(async (req, res) =>
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: 'Reservation cancelled',
      data: await ReservationService.cancel(
        res.locals.user.id,
        res.locals.user.companyId,
        res.locals.user.role,
        String(req.params.id),
        req.body?.reason,
      ),
    }),
  ),
  extend: catchAsync(async (req, res) =>
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: 'Reservation extended',
      data: await ReservationService.extend(
        res.locals.user.id,
        res.locals.user.companyId,
        String(req.params.id),
        req.body?.minutes,
      ),
    }),
  ),
  create: catchAsync(async (req, res) =>
    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: 'Reservation confirmed',
      data: await ReservationService.create(res.locals.user.id, res.locals.user.companyId, {
        ...reservationSchema.parse(req.body),
        userId: res.locals.user.role === 'ADMIN' ? req.body.userId : undefined,
      }),
    }),
  ),
  instant: catchAsync(async (req, res) => {
    const input = instantSchema.parse(req.body);
    return sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: 'Instant booking confirmed',
      data: await ReservationService.instant(
        res.locals.user.id,
        res.locals.user.companyId,
        input.roomId,
        input.minutes,
      ),
    });
  }),
  checkIn: catchAsync(async (req, res) =>
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: 'Checked in',
      data: await ReservationService.checkIn(res.locals.user.id, String(req.params.id)),
    }),
  ),
  checkOut: catchAsync(async (req, res) =>
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: 'Checked out',
      data: await ReservationService.checkOut(res.locals.user.id, String(req.params.id)),
    }),
  ),
};
