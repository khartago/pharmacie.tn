import express from 'express';
import {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  expressInterest,
  updateInterestStatus,
  supplierAcceptRetour,
  getMyInterests,
  refuseRetour,
  markRetourDone,
  markAsSold,
  cancelInterest
} from '../controllers/announcementController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Public routes (for authenticated users)
router.get('/', asyncHandler(getAnnouncements));
// IMPORTANT: define specific routes before parameterized routes
router.get('/my-interests', requireRole(['PHARMACY']), asyncHandler(getMyInterests));
router.get('/:id', asyncHandler(getAnnouncementById));

// Pharmacy routes
router.post('/', requireRole(['PHARMACY']), asyncHandler(createAnnouncement));
router.put('/:id', asyncHandler(updateAnnouncement));
router.delete('/:id', asyncHandler(deleteAnnouncement));

// Interest routes
router.post('/:id/interest', requireRole(['PHARMACY']), asyncHandler(expressInterest));
router.put('/:id/interests/:interestId', asyncHandler(updateInterestStatus));
router.delete('/interests/:interestId', requireRole(['PHARMACY']), asyncHandler(cancelInterest));

// Supplier direct acceptance for retours
router.post('/:id/supplier-accept', requireRole(['SUPPLIER']), asyncHandler(supplierAcceptRetour));

// New dual status workflow routes
router.post('/:id/sold', requireRole(['PHARMACY']), asyncHandler(markAsSold));
router.post('/:id/retour-refuse', requireRole(['SUPPLIER']), asyncHandler(refuseRetour));
router.post('/:id/retour-done', asyncHandler(markRetourDone));

export default router;