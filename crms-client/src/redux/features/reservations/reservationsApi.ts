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
export const instantReservation = (token: string, roomId: string, minutes: 15 | 30 | 45 | 60) =>
  apiRequest<{ data: Reservation }>('/reservations/instant', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ roomId, minutes }),
  }).then((response) => response.data);

export const checkInReservation = (token: string, id: string) =>
  apiRequest(`/reservations/${id}/check-in`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
export const checkOutReservation = (token: string, id: string) =>
  apiRequest(`/reservations/${id}/check-out`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
export const extendReservation = (token: string, id: string, minutes: 15 | 30) => apiRequest<{ data: Reservation }>(`/reservations/${id}/extend`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ minutes }) }).then((response) => response.data);
