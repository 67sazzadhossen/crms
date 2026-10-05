import { Router } from 'express';
import { auth, admin } from '../../middlewares/auth.js';
import { RoomController } from './room.controller.js';
const router = Router();
router.get('/', auth, RoomController.list);
router.post('/', auth, admin, RoomController.create);
router.patch('/:id', auth, admin, RoomController.update);
router.delete('/:id', auth, admin, RoomController.remove);
export default router;
