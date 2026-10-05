import { apiRequest } from '../../api/baseApi';
export type Room = {
  id: string;
  name: string;
  capacity: number;
  equipmentList: string[];
  hourlyRate: number;
  isActive: boolean;
};
export const getRooms = async (token: string) =>
  (await apiRequest<{ data: Room[] }>('/rooms', { headers: { Authorization: `Bearer ${token}` } }))
    .data;
export const createRoom = (
  token: string,
  data: { name: string; capacity: number; equipmentList: string[]; hourlyRate: number },
) =>
  apiRequest<{ data: Room }>('/rooms', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  }).then((response) => response.data);

export const updateRoom = (token: string, id: string, data: Partial<Omit<Room, 'id' | 'isActive'>>) => apiRequest<{ data: Room }>(`/rooms/${id}`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }).then((response) => response.data);
export const deleteRoom = (token: string, id: string) => apiRequest(`/rooms/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
