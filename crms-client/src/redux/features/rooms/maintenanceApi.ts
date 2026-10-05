import { apiRequest } from '../../api/baseApi';
export type Maintenance = {
  id: string;
  roomId: string;
  startTime: string;
  endTime: string;
  reason?: string | null;
  room?: { name: string };
};
export const getMaintenance = async (token: string) =>
  (
    await apiRequest<{ data: Maintenance[] }>('/maintenance', {
      headers: { Authorization: `Bearer ${token}` },
    })
  ).data;
export const createMaintenance = (token: string, data: Omit<Maintenance, 'id' | 'room'>) =>
  apiRequest<{ data: Maintenance }>('/maintenance', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  }).then((response) => response.data);
export const deleteMaintenance = (token: string, id: string) =>
  apiRequest(`/maintenance/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
