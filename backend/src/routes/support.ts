import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import {
  getSupportTickets,
  getSupportTicketById,
  createSupportTicket,
  updateSupportTicket,
  deleteSupportTicket,
  getSupportTicketStats,
  replyToSupportTicket
} from '../controllers/supportController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { createPublicContact } from '../controllers/contactController';

const router = Router();

// Public contact endpoint (no authentication required)
router.post('/contact', asyncHandler(createPublicContact));

// All other routes require authentication
router.use(authenticateToken);

// Public routes (for authenticated users)
router.get('/', asyncHandler(getSupportTickets));
router.get('/:id', asyncHandler(getSupportTicketById));
router.post('/', asyncHandler(createSupportTicket));
router.put('/:id', asyncHandler(updateSupportTicket));
router.delete('/:id', asyncHandler(deleteSupportTicket));

// Admin routes
router.get('/admin/stats', requireRole(['ADMIN']), asyncHandler(getSupportTicketStats));
router.post('/:id/reply', requireRole(['ADMIN']), asyncHandler(replyToSupportTicket));

export default router;