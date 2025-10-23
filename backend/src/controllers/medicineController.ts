import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../types';

export const getMedicines = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query as any;
    const skip = (page - 1) * limit;

    const [medicines, total] = await Promise.all([
      prisma.medicine.findMany({
        skip,
        take: parseInt(limit),
        orderBy: [
          { dci: 'asc' },
          { brandName: 'asc' }
        ]
      }),
      prisma.medicine.count()
    ]);

    res.json({
      success: true,
      data: {
        medicines,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get medicines error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get medicines'
    });
  }
};

export const searchMedicines = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      query,
      dci,
      brandName,
      laboratoire,
      atcCode,
      page = 1,
      limit = 20
    } = req.query as any;

    const skip = (page - 1) * limit;
    const where: any = {};

    // Build search conditions
    if (query) {
      where.OR = [
        { dci: { contains: query, mode: 'insensitive' } },
        { brandName: { contains: query, mode: 'insensitive' } },
        { laboratoire: { contains: query, mode: 'insensitive' } },
        { atcCode: { contains: query, mode: 'insensitive' } }
      ];
    }

    if (dci) {
      where.dci = { contains: dci, mode: 'insensitive' };
    }

    if (brandName) {
      where.brandName = { contains: brandName, mode: 'insensitive' };
    }

    if (laboratoire) {
      where.laboratoire = { contains: laboratoire, mode: 'insensitive' };
    }

    if (atcCode) {
      where.atcCode = { contains: atcCode, mode: 'insensitive' };
    }

    const [medicines, total] = await Promise.all([
      prisma.medicine.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: [
          { dci: 'asc' },
          { brandName: 'asc' }
        ]
      }),
      prisma.medicine.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        medicines,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Search medicines error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search medicines'
    });
  }
};

export const getMedicineById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Medicine ID is required'
      });
      return;
    }

    const medicine = await prisma.medicine.findUnique({
      where: { id: parseInt(id) },
      include: {
        announcements: {
          where: {
            status: 'AVAILABLE'
          },
          include: {
            pharmacyUser: {
              select: {
                id: true,
                name: true,
                city: true
              }
            }
          },
          orderBy: {
            expiryDate: 'asc'
          },
          take: 10
        },
        requests: {
          where: {
            status: 'OPEN'
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                city: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    });

    if (!medicine) {
      res.status(404).json({
        success: false,
        error: 'Medicine not found'
      });
      return;
    }

    res.json({
      success: true,
      data: medicine
    });
  } catch (error) {
    console.error('Get medicine error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get medicine'
    });
  }
};

export const createMedicine = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { dci, brandName, dosage, form, laboratoire, atcCode } = req.body;

    // Validate required fields
    if (!dci || !brandName || !dosage || !form || !laboratoire) {
      res.status(400).json({
        success: false,
        error: 'DCI, brand name, dosage, form, and laboratoire are required'
      });
      return;
    }

    const medicine = await prisma.medicine.create({
      data: {
        dci,
        brandName,
        dosage,
        form,
        laboratoire,
        atcCode
      }
    });

    res.status(201).json({
      success: true,
      data: medicine,
      message: 'Medicine created successfully'
    });
  } catch (error) {
    console.error('Create medicine error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create medicine'
    });
  }
};

export const updateMedicine = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { dci, brandName, dosage, form, laboratoire, atcCode } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Medicine ID is required'
      });
      return;
    }

    const medicine = await prisma.medicine.update({
      where: { id: parseInt(id) },
      data: {
        ...(dci && { dci }),
        ...(brandName && { brandName }),
        ...(dosage && { dosage }),
        ...(form && { form }),
        ...(laboratoire && { laboratoire }),
        ...(atcCode !== undefined && { atcCode })
      }
    });

    res.json({
      success: true,
      data: medicine,
      message: 'Medicine updated successfully'
    });
  } catch (error) {
    console.error('Update medicine error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update medicine'
    });
  }
};

export const deleteMedicine = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Medicine ID is required'
      });
      return;
    }

    await prisma.medicine.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Medicine deleted successfully'
    });
  } catch (error) {
    console.error('Delete medicine error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete medicine'
    });
  }
};

// Note: Excel import functionality is implemented in MedicineImportService
// and accessible via POST /api/admin/medicines/import endpoint