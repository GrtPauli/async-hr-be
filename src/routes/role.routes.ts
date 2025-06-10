import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Apply auth and admin role middleware to all routes
router.use(authMiddleware, roleMiddleware(['admin']));

router.post('/', RoleController.createRole);
router.get('/', RoleController.getAllRoles);
router.get('/:id', RoleController.getRoleById);
router.put('/:id', RoleController.updateRole);
router.delete('/:id', RoleController.deleteRole);

export default router;