import { prisma } from '../../../../prisma/lib/prisma.js';
import { writeAudit } from '../../utils/audit.js';
import ApiError from '../../errors/ApiError.js';
export const ReservationService = {
  list: (userId: string, companyId: string, role: string) =>
    prisma.reservation.findMany({
      where:
        role === 'ADMIN' ? {} : role === 'CLIENT_MANAGER' ? { clientId: companyId } : { userId },
      include: {
        room: true,
        usageLog: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { scheduledStart: 'asc' },
    }),
  create: async (
    userId: string,
    companyId: string,
    data: {
      roomId: string;
      type?: string;
      scheduledStart: string;
      scheduledEnd: string;
      userId?: string;
    },
  ) => {
    const start = new Date(data.scheduledStart);
    const end = new Date(data.scheduledEnd);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start)
      throw new ApiError(400, 'End time must be after start time', 'INVALID_TIME_WINDOW');
    const hoursAhead = (start.getTime() - Date.now()) / 3600000;
    if (hoursAhead < 2 || hoursAhead > 1440)
      throw new ApiError(
        400,
        'Reservations must be made between 2 hours and 60 days ahead',
        'INVALID_ADVANCE_WINDOW',
      );
    const bufferedStart = new Date(start.getTime() - 10 * 60000);
    const bufferedEnd = new Date(end.getTime() + 10 * 60000);
    const conflict = await prisma.reservation.findFirst({
      where: {
        roomId: data.roomId,
        status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
        scheduledStart: { lt: bufferedEnd },
        scheduledEnd: { gt: bufferedStart },
      },
    });
    if (conflict)
      throw new ApiError(409, 'Room is already reserved for this time', 'ROOM_CONFLICT');
    const reservation = await prisma.reservation.create({
      data: {
        userId: data.userId ?? userId,
        clientId: companyId,
        roomId: data.roomId,
        type: data.type ?? 'PRE',
        status: 'CONFIRMED',
        scheduledStart: start,
        scheduledEnd: end,
      },
    });
    await writeAudit({
      actorId: userId,
      entityType: 'RESERVATION',
      entityId: reservation.id,
      action: 'CREATED',
      newData: reservation,
    });
    return reservation;
  },
  instant: async (
    userId: string,
    companyId: string,
    roomId: string,
    minutes: 15 | 30 | 45 | 60,
  ) => {
    const start = new Date();
    const end = new Date(start.getTime() + minutes * 60000);
    const conflict = await prisma.reservation.findFirst({
      where: {
        roomId,
        status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
        scheduledStart: { lt: new Date(end.getTime() + 10 * 60000) },
        scheduledEnd: { gt: new Date(start.getTime() - 10 * 60000) },
      },
    });
    if (conflict) throw new Error('Room is currently occupied');
    const reservation = await prisma.reservation.create({
      data: {
        userId,
        clientId: companyId,
        roomId,
        type: 'INSTANT',
        status: 'CHECKED_IN',
        scheduledStart: start,
        scheduledEnd: end,
        actualCheckIn: start,
      },
    });
    await writeAudit({
      actorId: userId,
      entityType: 'RESERVATION',
      entityId: reservation.id,
      action: 'INSTANT_CREATED',
      newData: reservation,
    });
    return reservation;
  },
  checkIn: async (userId: string, id: string) =>
    prisma.reservation.updateMany({
      where: { id, userId, status: 'CONFIRMED' },
      data: { status: 'CHECKED_IN', actualCheckIn: new Date() },
    }),
  checkOut: async (userId: string, id: string) => {
    const reservation = await prisma.reservation.findFirstOrThrow({ where: { id, userId } });
    const end = new Date();
    const start = reservation.actualCheckIn ?? new Date();
    const mins = Math.max(0, Math.ceil((end.getTime() - start.getTime()) / 60000));
    await prisma.reservation.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        actualCheckOut: end,
        usageLog: {
          upsert: {
            create: {
              clientId: reservation.clientId,
              userId: reservation.userId,
              roomId: reservation.roomId,
              scheduledStart: reservation.scheduledStart,
              scheduledEnd: reservation.scheduledEnd,
              startTime: start,
              endTime: end,
              scheduledMinutes: Math.ceil(
                (reservation.scheduledEnd.getTime() - reservation.scheduledStart.getTime()) / 60000,
              ),
              actualConsumedMinutes: mins,
              billableMins: mins,
            },
            update: { endTime: end, billableMins: mins },
          },
        },
      },
    });
    await writeAudit({
      actorId: userId,
      entityType: 'RESERVATION',
      entityId: id,
      action: 'CHECKED_OUT',
      newData: { actualCheckOut: end, billableMinutes: mins },
    });
    return { billableMins: mins };
  },
  cancel: async (userId: string, companyId: string, role: string, id: string, reason?: string) => {
    const reservation = await prisma.reservation.findFirstOrThrow({
      where:
        role === 'ADMIN'
          ? { id }
          : { id, clientId: companyId, ...(role === 'MEMBER' ? { userId } : {}) },
    });
    if (reservation.status === 'CANCELLED' || reservation.status === 'COMPLETED')
      throw new Error('Reservation cannot be cancelled');
    if (role !== 'ADMIN' && reservation.scheduledStart.getTime() - Date.now() < 60 * 60000)
      throw new Error('Cancellation must be made at least 1 hour before start');
    const updated = await prisma.reservation.update({
      where: { id },
      data: { status: 'CANCELLED', cancelledAt: new Date(), cancellationReason: reason },
    });
    await writeAudit({
      actorId: userId,
      entityType: 'RESERVATION',
      entityId: id,
      action: 'CANCELLED',
      reason,
      previousData: reservation,
      newData: updated,
    });
    return updated;
  },
  extend: async (userId: string, companyId: string, id: string, minutes: 15 | 30) => {
    const reservation = await prisma.reservation.findFirstOrThrow({
      where: { id, userId, clientId: companyId, status: 'CHECKED_IN' },
    });
    const next = await prisma.reservation.findFirst({
      where: {
        roomId: reservation.roomId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        scheduledStart: { gte: reservation.scheduledEnd },
        id: { not: id },
      },
      orderBy: { scheduledStart: 'asc' },
    });
    if (
      next &&
      next.scheduledStart.getTime() - reservation.scheduledEnd.getTime() < (minutes + 10) * 60000
    )
      throw new Error('No space to extend before the next reservation');
    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        scheduledEnd: new Date(reservation.scheduledEnd.getTime() + minutes * 60000),
        extensionMinutes: { increment: minutes },
      },
    });
    await writeAudit({
      actorId: userId,
      entityType: 'RESERVATION',
      entityId: id,
      action: 'EXTENDED',
      newData: { minutes },
    });
    return updated;
  },
};
