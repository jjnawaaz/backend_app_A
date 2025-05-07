import { Router } from 'express';
import * as adminController from '../controllers/admin/admin.controller';
import { authenticateAdmin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { loginSchema, createAdminSchema } from '../validations/admin.validation';

const router = Router();

// Public route
router.post('/login', validate(loginSchema), adminController.login);

// Protected routes (admin only)
router.post('/', authenticateAdmin, validate(createAdminSchema), adminController.createAdmin);
router.get('/', authenticateAdmin, adminController.getAllAdmins);

export default router;