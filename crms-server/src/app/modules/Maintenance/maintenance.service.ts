import { prisma } from '../../../../prisma/lib/prisma.js';
import ApiError from '../../errors/ApiError.js';
export const MaintenanceService = {
  list: () =>
    prisma.maintenanceSchedule.findMany({ include: { room: true }, orderBy: { startTime: 'asc' } }),
  create: async (data: { roomId: string; startTime: string; endTime: string; reason?: string }) => {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    if (end <= start) throw new ApiError(400, 'Maintenance end must be after start');
    const conflict = await prisma.reservation.findFirst({
      where: {
        roomId: data.roomId,
        status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
        scheduledStart: { lt: end },
        scheduledEnd: { gt: start },
      },
    });
    if (conflict) throw new ApiError(409, 'Room has a reservation during this maintenance window');
    return prisma.maintenanceSchedule.create({
      data: { roomId: data.roomId, startTime: start, endTime: end, reason: data.reason },
    });
  },
  remove: (id: string) => prisma.maintenanceSchedule.delete({ where: { id } }),
};
