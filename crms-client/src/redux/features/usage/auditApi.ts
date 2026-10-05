import { apiRequest } from '../../api/baseApi';
export type AuditLog = {
  id: string;
  actorId?: string;
  entityType: string;
  entityId: string;
  action: string;
  reason?: string;
  createdAt: string;
};
export const getAuditLogs = async (token: string) =>
  (
    await apiRequest<{ data: AuditLog[] }>('/audit', {
      headers: { Authorization: `Bearer ${token}` },
    })
  ).data;
