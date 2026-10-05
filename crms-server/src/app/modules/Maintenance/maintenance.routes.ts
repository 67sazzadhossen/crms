import { Router } from 'express';
import { auth, admin } from '../../middlewares/auth.js';
import { MaintenanceController } from './maintenance.controller.js';
const router = Router();
router.use(auth);
router.get('/', MaintenanceController.list);
router.post('/', admin, MaintenanceController.create);
router.delete('/:id', admin, MaintenanceController.remove);
export default router;
