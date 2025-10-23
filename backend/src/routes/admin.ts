import { Router } from 'express';
import { 
  createAccount, 
  getAccountStats, 
  getPharmacies, 
  getSuppliers, 
  updateAccountStatus, 
  updateAccount,
  deleteAccount 
} from '../controllers/adminController';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Account management
router.post('/accounts', asyncHandler(createAccount));
router.get('/accounts/stats', asyncHandler(getAccountStats));
router.get('/pharmacies', asyncHandler(getPharmacies));
router.get('/suppliers', asyncHandler(getSuppliers));
router.put('/accounts/:id', asyncHandler(updateAccount));
router.post('/accounts/:id/status', asyncHandler(updateAccountStatus));
router.delete('/accounts/:id', asyncHandler(deleteAccount));

export default router; 