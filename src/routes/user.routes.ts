import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { adminMiddleware, authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Admin only routes
router.get('/', adminMiddleware, UserController.getAllUsers);
router.get('/:id', adminMiddleware, UserController.getUserById as any);
router.put('/:id', UserController.updateUser as any);
router.delete('/:id', UserController.deleteUser as any);

export default router;