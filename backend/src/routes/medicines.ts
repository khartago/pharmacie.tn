import express from 'express';
import {
  getMedicines,
  searchMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine
} from '../controllers/medicineController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Public routes (for authenticated users)
router.get('/', asyncHandler(getMedicines));
router.get('/search', asyncHandler(searchMedicines));
router.get('/:id', asyncHandler(getMedicineById));

// Admin only routes
router.post('/', requireRole(['ADMIN']), asyncHandler(createMedicine));
router.put('/:id', requireRole(['ADMIN']), asyncHandler(updateMedicine));
router.delete('/:id', requireRole(['ADMIN']), asyncHandler(deleteMedicine));
// Note: Excel import functionality is implemented in MedicineImportService
// and accessible via POST /api/admin/medicines/import endpoint

export default router;