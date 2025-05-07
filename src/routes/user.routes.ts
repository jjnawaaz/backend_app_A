import { Router } from 'express';
import * as authController from '../controllers/user/auth.controller';
import * as groupController from '../controllers/user/group.controller';
import { authenticateUser } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { loginSchema, signupSchema } from '../validations/user.validation';

const router = Router();

// Auth routes
router.post('/signup', validate(signupSchema), authController.signup);
router.post('/login', validate(loginSchema), authController.login);
router.get('/verify-email/:token', authController.verifyEmail);

// Group routes
router.post('/groups', authenticateUser, groupController.createGroup);
router.post('/groups/:groupId/join', authenticateUser, groupController.joinGroup);
router.post('/groups/:groupId/leave', authenticateUser, groupController.leaveGroup);

export default router;