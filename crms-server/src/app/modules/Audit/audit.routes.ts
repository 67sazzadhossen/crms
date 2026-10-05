import { Router } from 'express';
import { auth, admin } from '../../middlewares/auth.js';
import { prisma } from '../../../../prisma/lib/prisma.js';
import catchAsync from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
const router = Router();
router.get(
  '/',
  auth,
  admin,
  catchAsync(async (_req, res) =>
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Audit logs retrieved',
      data: await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200 }),
    }),
  ),
);
export default router;
