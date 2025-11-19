/**
 * Auth Routes
 *
 * Defines authentication-related API endpoints: register, login, logout, and get current user.
 * Uses authController for logic and authenticate middleware for protected routes.
 */
import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes (no authentication required)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (require JWT authentication)
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);

export default router;
