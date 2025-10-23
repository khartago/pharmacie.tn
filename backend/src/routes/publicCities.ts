import express from 'express';
import { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import prisma from '../lib/prisma';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all cities (public endpoint for authenticated users)
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { region, search, page = 1, limit = 100 } = req.query as any;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filter by region if provided (check for valid values, not "undefined" string)
    if (region && region !== 'ALL' && region !== 'undefined' && typeof region === 'string') {
      // Map display names to enum values
      const regionMap: { [key: string]: string } = {
        'Tunis': 'TUNIS',
        'Ariana': 'ARIANA',
        'Ben Arous': 'BEN_AROUS',
        'Manouba': 'MANOUBA',
        'Nabeul': 'NABEUL',
        'Zaghouan': 'ZAGHOUAN',
        'Bizerte': 'BIZERTE',
        'Béja': 'BEJA',
        'Jendouba': 'JENDOUBA',
        'Kef': 'KEF',
        'Siliana': 'SILIANA',
        'Sousse': 'SOUSSE',
        'Monastir': 'MONASTIR',
        'Mahdia': 'MAHDIA',
        'Sfax': 'SFAX',
        'Kairouan': 'KAIROUAN',
        'Kasserine': 'KASSERINE',
        'Sidi Bouzid': 'SIDI_BOUZID',
        'Gabès': 'GABES',
        'Médenine': 'MEDENINE',
        'Tataouine': 'TATAOUINE',
        'Gafsa': 'GAFSA',
        'Tozeur': 'TOZEUR',
        'Kébili': 'KEBILI'
      };
      
      const regionEnum = regionMap[region] || (region ? region.toUpperCase() : 'TUNIS');
      where.region = regionEnum as any;
    }

    // Add search functionality (check for valid values, not "undefined" string)
    if (search && search !== 'undefined' && typeof search === 'string' && search.trim() !== '') {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [cities, total] = await Promise.all([
      prisma.city.findMany({
        where,
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          name: true,
          region: true
        },
        orderBy: { name: 'asc' }
      }),
      prisma.city.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        data: cities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get cities error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cities'
    });
  }
}));

// Get cities by region
router.get('/region/:region', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { region } = req.params;
    
    // Map display names to enum values
    const regionMap: { [key: string]: string } = {
      'Tunis': 'TUNIS',
      'Ariana': 'ARIANA',
      'Ben Arous': 'BEN_AROUS',
      'Manouba': 'MANOUBA',
      'Nabeul': 'NABEUL',
      'Zaghouan': 'ZAGHOUAN',
      'Bizerte': 'BIZERTE',
      'Béja': 'BEJA',
      'Jendouba': 'JENDOUBA',
      'Kef': 'KEF',
      'Siliana': 'SILIANA',
      'Sousse': 'SOUSSE',
      'Monastir': 'MONASTIR',
      'Mahdia': 'MAHDIA',
      'Sfax': 'SFAX',
      'Kairouan': 'KAIROUAN',
      'Kasserine': 'KASSERINE',
      'Sidi Bouzid': 'SIDI_BOUZID',
      'Gabès': 'GABES',
      'Médenine': 'MEDENINE',
      'Tataouine': 'TATAOUINE',
      'Gafsa': 'GAFSA',
      'Tozeur': 'TOZEUR',
      'Kébili': 'KEBILI'
    };

    const regionEnum = region && regionMap[region] ? regionMap[region] : (region ? region.toUpperCase() : 'TUNIS');
    
    const cities = await prisma.city.findMany({
      where: { region: regionEnum as any },
      select: {
        id: true,
        name: true,
        region: true
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: cities
    });
  } catch (error) {
    console.error('Get cities by region error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cities by region'
    });
  }
}));

export default router;
