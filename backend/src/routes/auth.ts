import express from 'express';
import { register, login, getMe, forgotPassword, resetPassword, updateProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { authRateLimit } from '../middleware/security';

const router = express.Router();

// Public routes with stricter rate limiting
router.post('/register', authRateLimit, asyncHandler(register));
router.post('/login', authRateLimit, asyncHandler(login));
router.post('/forgot-password', authRateLimit, asyncHandler(forgotPassword));
router.post('/reset-password', authRateLimit, asyncHandler(resetPassword));

// Protected routes
router.get('/me', authenticateToken, asyncHandler(getMe));
router.put('/profile', authenticateToken, asyncHandler(updateProfile));


export default router;