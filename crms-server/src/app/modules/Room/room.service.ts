import { prisma } from '../../../../prisma/lib/prisma.js';
export const RoomService = {
  list: () =>
    prisma.conferenceRoom.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
  create: (data: {
    name: string;
    capacity: number;
    equipmentList?: string[];
    hourlyRate?: number;
  }) => prisma.conferenceRoom.create({ data }),  update: (id: string, data: { name?: string; capacity?: number; equipmentList?: string[]; hourlyRate?: number }) => prisma.conferenceRoom.update({ where: { id }, data }),
  remove: (id: string) => prisma.conferenceRoom.update({ where: { id }, data: { isActive: false } }),
};
