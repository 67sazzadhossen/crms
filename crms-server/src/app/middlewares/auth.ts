import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { prisma } from '../../../prisma/lib/prisma.js';
import ApiError from '../errors/ApiError.js';
import catchAsync from '../../shared/catchAsync.js';
export const auth = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer /, '');
  if (!token) throw new ApiError(401, 'Please sign in');
  let id: string;
  try {
    id = (jwt.verify(token, env.jwtSecret) as { userId: string }).userId;
  } catch {
    throw new ApiError(401, 'Session expired');
  }
  const user = await prisma.user.findUnique({ where: { id }, include: { company: true } });
  if (!user || user.company.status !== 'ACTIVE') throw new ApiError(401, 'Account is unavailable');
  res.locals.user = user;
  next();
});
export const admin: RequestHandler = (req, res, next) =>
  res.locals.user.role === 'ADMIN'
    ? next()
    : next(new ApiError(403, 'Administrator access required'));
