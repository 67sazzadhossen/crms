import { prisma } from '../../../prisma/lib/prisma.js';
export async function writeAudit(input: {
  actorId?: string;
  actorRole?: string;
  entityType: string;
  entityId: string;
  action: string;
  previousData?: unknown;
  newData?: unknown;
  reason?: string;
  metadata?: unknown;
}) {
  return prisma.auditLog.create({
    data: {
      actorId: input.actorId,
      actorRole: input.actorRole,
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      previousData: input.previousData as never,
      newData: input.newData as never,
      reason: input.reason,
      metadata: input.metadata as never,
    },
  });
}
