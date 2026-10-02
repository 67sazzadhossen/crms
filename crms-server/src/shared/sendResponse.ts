import type { Response } from 'express';
type ResponsePayload = {
  statusCode: number;
  success: boolean;
  message: string;
  data?: unknown;
  meta?: unknown;
};
export default function sendResponse(res: Response, payload: ResponsePayload) {
  return res.status(payload.statusCode).json(payload);
}
