import express from 'express';
import {
  getNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  getNotificationStats
} from '../controllers/notificationController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// User notification routes
router.get('/', asyncHandler(getNotifications));
router.get('/stats', asyncHandler(getNotificationStats));
router.get('/:id', asyncHandler(getNotificationById));
router.put('/:id/read', asyncHandler(markAsRead));
router.put('/read-all', asyncHandler(markAllAsRead));
router.delete('/:id', asyncHandler(deleteNotification));

// Admin routes
router.post('/', requireRole(['ADMIN']), asyncHandler(createNotification));

export default router;