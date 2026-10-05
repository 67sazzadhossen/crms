import { apiRequest } from '../../api/baseApi';
export type Reservation = {
  id: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: string;
  room: { name: string };
  user?: { name: string; email: string; phone?: string | null };
};
export const getReservations = async (token: string) =>
  (
    await apiRequest<{ data: Reservation[] }>('/reservations', {
      headers: { Authorization: `Bearer ${token}` },
    })
  ).data;
export const createReservation = (
  token: string,
  data: {
    roomId: string;
    scheduledStart: string;
    scheduledEnd: string;
    type: string;
    userId?: string;
  },
) =>
  apiRequest<{ data: Reservation }>('/reservations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  }).then((response) => response.data);

export const cancelReservation = (token: string, id: string, reason?: string) =>
  apiRequest<{ data: Reservation }>(`/reservations/${id}/cancel`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ reason }),
  }).then((response) => response.data);
