import { apiRequest } from '../../api/baseApi';
import type { AuthUser } from '../../../types/auth';
export type LoginPayload = { identifier: string; password: string };
export type AuthResponse = { user: AuthUser; accessToken: string };
export const login = async (payload: LoginPayload) => {
  const response = await apiRequest<{ data: AuthResponse }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.data;
};
