import { z } from 'zod';
export const registerSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(7).optional(),
  name: z.string().min(2),
  password: z.string().min(8),
  companyName: z.string().min(2),
});
export const loginSchema = z.object({ identifier: z.string().min(3), password: z.string().min(1) });
