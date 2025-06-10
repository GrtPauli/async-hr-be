import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Admin only routes
router.get('/', roleMiddleware(['admin']), UserController.getAllUsers);
router.get('/:id', roleMiddleware(['admin']), UserController.getUserById);
router.put('/:id', roleMiddleware(['admin']), UserController.updateUser);
router.delete('/:id', roleMiddleware(['admin']), UserController.deleteUser);

export default router;