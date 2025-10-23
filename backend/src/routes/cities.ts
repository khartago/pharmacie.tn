import { Router } from 'express';
import {
  getAllCities,
  getCityById,
  createCity,
  updateCity,
  deleteCity,
  getCitiesStats,
  getCitiesByRegion
} from '../controllers/cityController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

// Get all cities with filtering and pagination
router.get('/', getAllCities);

// Get cities statistics
router.get('/stats', getCitiesStats);

// Get cities by region (for dropdowns)
router.get('/region/:region', getCitiesByRegion);

// Get city by ID
router.get('/:id', getCityById);

// Create new city
router.post('/', createCity);

// Update city
router.put('/:id', updateCity);

// Delete city
router.delete('/:id', deleteCity);

export default router;
