import express from 'express';
import {
  getRequests,
  getRequestById,
  createRequest,
  updateRequest,
  deleteRequest,
  respondToRequest,
  updateResponseStatus,
  getMyResponses,
  markRequestAsCompleted
} from '../controllers/requestController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Public routes (for authenticated users)
router.get('/', asyncHandler(getRequests));
router.get('/my-responses', asyncHandler(getMyResponses));
router.get('/:id', asyncHandler(getRequestById));

// Request management
router.post('/', asyncHandler(createRequest));
router.put('/:id', asyncHandler(updateRequest));
router.delete('/:id', asyncHandler(deleteRequest));

// Response management
router.post('/:id/respond', requireRole(['PHARMACY']), asyncHandler(respondToRequest));
router.put('/:id/responses/:responseId', asyncHandler(updateResponseStatus));
router.post('/:id/complete', asyncHandler(markRequestAsCompleted));

export default router;