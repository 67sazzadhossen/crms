import { z } from 'zod';
export const reservationSchema = z.object({
  roomId: z.string().min(1),
  scheduledStart: z.string(),
  scheduledEnd: z.string(),
  type: z.enum(['PRE', 'INSTANT']).default('PRE'),
  userId: z.string().optional(),
});
export const instantSchema = z.object({
  roomId: z.string().min(1),
  minutes: z.union([z.literal(15), z.literal(30), z.literal(45), z.literal(60)]),
});
