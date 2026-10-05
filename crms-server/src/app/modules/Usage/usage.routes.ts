import { Router } from 'express';
import { auth } from '../../middlewares/auth.js';
import { UsageController } from './usage.controller.js';
const router = Router();
router.get('/', auth, UsageController.list);
export default router;
