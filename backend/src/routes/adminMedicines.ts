import { Router } from 'express';
import multer from 'multer';
import { MedicineImportService } from '../services/medicineImportService';
import { authenticateToken, requireRole } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import prisma from '../lib/prisma';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Additional file type validation
    if (file.mimetype === 'application/vnd.ms-excel' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.originalname.endsWith('.xls') ||
        file.originalname.endsWith('.xlsx')) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xls, .xlsx) are allowed'));
    }
  }
});

/**
 * POST /admin/medicines/import
 * Import medicines from Excel file
 * Requires: ADMIN or SUPPLIER role
 */
router.post('/import', 
  authenticateToken, 
  requireRole(['ADMIN', 'SUPPLIER']), 
  upload.single('file'),
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false,
          error: 'No file uploaded. Please provide a file in the "file" field.' 
        });
      }

      const result = await MedicineImportService.importMedicines(req.file, req.user!.id);

      return res.status(200).json({
        success: true,
        message: 'Medicines imported successfully',
        data: result
      });
    } catch (error: any) {
      console.error('❌ Error importing medicines:', error);
      
      if (error.message.includes('Invalid file type') || error.message.includes('Only Excel files')) {
        return res.status(400).json({ 
          success: false,
          error: error.message 
        });
      }

      return res.status(500).json({ 
        success: false,
        error: 'Failed to import medicines. Please try again.' 
      });
    }
  }
);

/**
 * GET /admin/medicines/count
 * Get current medicine count
 * Requires: ADMIN or SUPPLIER role
 */
router.get('/count', 
  authenticateToken, 
  requireRole(['ADMIN', 'SUPPLIER']), 
  async (_req, res) => {
    try {
      const count = await MedicineImportService.getMedicineCount();
      
      res.status(200).json({
        success: true,
        data: {
          count,
          lastUpdated: new Date()
        }
      });
    } catch (error) {
      console.error('❌ Error getting medicine count:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to get medicine count' 
      });
    }
  }
);

/**
 * GET /admin/medicines/last-import
 * Get last import information
 * Requires: ADMIN or SUPPLIER role
 */
router.get('/last-import', 
  authenticateToken, 
  requireRole(['ADMIN', 'SUPPLIER']), 
  async (_req, res) => {
    try {
      const lastImport = await MedicineImportService.getLastImportInfo();
      
      res.status(200).json({
        success: true,
        data: lastImport
      });
    } catch (error) {
      console.error('❌ Error getting last import info:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to get last import info' 
      });
    }
  }
);

/**
 * GET /admin/medicines
 * Get all medicines with pagination
 * Requires: ADMIN or SUPPLIER role
 */
router.get('/', 
  authenticateToken, 
  requireRole(['ADMIN', 'SUPPLIER']), 
  async (req, res) => {
    try {
             const page = parseInt(req.query['page'] as string) || 1;
       const limit = parseInt(req.query['limit'] as string) || 50;
       const search = req.query['search'] as string;
      
      const skip = (page - 1) * limit;
      
      // Build where clause for search
      const where: any = {};
      if (search) {
        where.OR = [
          { dci: { contains: search, mode: 'insensitive' } },
          { brandName: { contains: search, mode: 'insensitive' } },
          { laboratoire: { contains: search, mode: 'insensitive' } }
        ];
      }
      
      // Get medicines with pagination
      const [medicines, total] = await Promise.all([
        prisma.medicine.findMany({
          where,
          skip,
          take: limit,
                     orderBy: { id: 'desc' }
        }),
        prisma.medicine.count({ where })
      ]);
      
      const totalPages = Math.ceil(total / limit);
      
      res.status(200).json({
        success: true,
        data: {
          data: medicines,
          pagination: {
            page,
            limit,
            total,
            totalPages
          }
        }
      });
    } catch (error) {
      console.error('❌ Error getting medicines:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to get medicines' 
      });
    }
  }
);

/**
 * GET /admin/medicines/stats
 * Get medicine statistics
 * Requires: ADMIN or SUPPLIER role
 */
router.get('/stats', 
  authenticateToken, 
  requireRole(['ADMIN', 'SUPPLIER']), 
  async (_req, res) => {
    try {
      const [count, lastImport] = await Promise.all([
        MedicineImportService.getMedicineCount(),
        MedicineImportService.getLastImportInfo()
      ]);
      
      res.status(200).json({
        success: true,
        data: {
          totalMedicines: count,
          lastImport: lastImport ? {
            filename: lastImport.filename,
            importedCount: lastImport.importedCount,
            importedAt: lastImport.importedAt
          } : null
        }
      });
    } catch (error) {
      console.error('❌ Error getting medicine stats:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to get medicine stats' 
      });
    }
  }
);

export default router; 