import { apiRequest } from '../../api/baseApi';
export type UsageLog = {
  id: string;
  billableMins: number;
  actualConsumedMinutes: number;
  overstayMinutes: number;
  reservation: {
    room: { name: string };
    user: { name: string; email?: string };
    scheduledStart: string;
    scheduledEnd: string;
  };
};
export const getUsage = async (token: string) =>
  (
    await apiRequest<{ data: UsageLog[] }>('/usage', {
      headers: { Authorization: `Bearer ${token}` },
    })
  ).data;
export type UsageUser = { id: string; name: string; email: string; role: string };
export const getUsageUsers = async (token: string) =>
  (
    await apiRequest<{ data: UsageUser[] }>('/auth/users', {
      headers: { Authorization: `Bearer ${token}` },
    })
  ).data;
