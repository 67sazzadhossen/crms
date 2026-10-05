import { prisma } from '../../../../prisma/lib/prisma.js';
export const UsageService = {
  list: (userId: string, companyId: string, role: string) =>
    prisma.usageLog.findMany({
      where:
        role === 'ADMIN' ? {} : role === 'CLIENT_MANAGER' ? { clientId: companyId } : { userId },
      include: { client: true, reservation: { include: { room: true, user: true } } },
      orderBy: { createdAt: 'desc' },
    }),
};
