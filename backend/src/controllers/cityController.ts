import { Response } from 'express';
import prisma from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { AuditService } from '../services/auditService';
import { AuthenticatedRequest } from '../types';
import { mapRegionToEnum, mapEnumToRegion, ENUM_TO_REGION } from '../utils/regionMapping';

// Get all cities with optional filtering
export const getAllCities = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { region, search, page = 1, limit = 50 } = req.query;
  
  const where: any = {};
  
  // Filter by region if provided (check for valid values, not "undefined" string)
  if (region && region !== 'all' && region !== 'undefined' && typeof region === 'string') {
    where.region = mapRegionToEnum(region as string);
  }
  
  // Add search functionality (check for valid values, not "undefined" string)
  if (search && search !== 'undefined' && typeof search === 'string' && (search as string).trim() !== '') {
    where.name = {
      contains: search as string,
      mode: 'insensitive'
    };
  }

  const [cities, total] = await Promise.all([
    prisma.city.findMany({
      where,
      include: {
        _count: {
          select: { users: true }
        }
      },
      orderBy: { name: 'asc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    }),
    prisma.city.count({ where })
  ]);

  const citiesWithUserCount = cities.map((city) => ({
    id: city.id.toString(),
    name: city.name,
    region: mapEnumToRegion(city.region),
    userCount: city._count.users
  }));

  return res.json({
    success: true,
    data: {
    data: citiesWithUserCount,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
        totalPages: Math.ceil(total / Number(limit))
      }
    }
  });
});

// Get city by ID
export const getCityById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({
      success: false,
      message: 'ID invalide'
    });
  }
  
  const city = await prisma.city.findUnique({
    where: { id: Number(id) },
    include: {
      _count: {
        select: { users: true }
      }
    }
  });

  if (!city) {
    return res.status(404).json({
      success: false,
      message: 'Ville non trouvée'
    });
  }

  return res.json({
    success: true,
    data: {
      id: city.id.toString(),
      name: city.name,
      region: mapEnumToRegion(city.region),
      userCount: city._count.users
    }
  });
});

// Create new city
export const createCity = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, region } = req.body;

  // Validate required fields
  if (!name || !region) {
    return res.status(400).json({
      success: false,
      message: 'Le nom et la région sont requis'
    });
  }

  // Convert display name to enum value
  const regionEnum = mapRegionToEnum(region);

  // Check if city already exists
  const existingCity = await prisma.city.findFirst({
    where: {
      name: { equals: name, mode: 'insensitive' },
      region: regionEnum
    }
  });

  if (existingCity) {
    return res.status(400).json({
      success: false,
      message: 'Cette ville existe déjà dans cette région'
    });
  }

  const city = await prisma.city.create({
    data: { name, region: regionEnum },
    include: {
      _count: {
        select: { users: true }
      }
    }
  });

  // Log the action
  await AuditService.logAction({
    userId: req.user?.id || null,
    action: 'CITY_CREATED',
    entityType: 'CITY',
    entityId: city.id.toString(),
    details: { name: city.name, region: city.region }
  });

  return res.status(201).json({
    success: true,
    data: {
      id: city.id.toString(),
      name: city.name,
      region: city.region,
      userCount: city._count.users
    }
  });
});

// Update city
export const updateCity = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, region } = req.body;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({
      success: false,
      message: 'ID invalide'
    });
  }

  // Validate required fields
  if (!name || !region) {
    return res.status(400).json({
      success: false,
      message: 'Le nom et la région sont requis'
    });
  }

  // Convert display name to enum value
  const regionEnum = mapRegionToEnum(region);

  // Check if city exists
  const existingCity = await prisma.city.findUnique({
    where: { id: Number(id) }
  });

  if (!existingCity) {
    return res.status(404).json({
      success: false,
      message: 'Ville non trouvée'
    });
  }

  // Check if another city with same name and region exists
  const duplicateCity = await prisma.city.findFirst({
    where: {
      name: { equals: name, mode: 'insensitive' },
      region: regionEnum,
      id: { not: Number(id) }
    }
  });

  if (duplicateCity) {
    return res.status(400).json({
      success: false,
      message: 'Cette ville existe déjà dans cette région'
    });
  }

  const city = await prisma.city.update({
    where: { id: Number(id) },
    data: { name, region: regionEnum },
    include: {
      _count: {
        select: { users: true }
      }
    }
  });

  // Log the action
  await AuditService.logAction({
    userId: req.user?.id || null,
    action: 'CITY_UPDATED',
    entityType: 'CITY',
    entityId: city.id.toString(),
    details: { 
      oldName: existingCity.name, 
      newName: city.name,
      oldRegion: existingCity.region,
      newRegion: city.region
    }
  });

  return res.json({
    success: true,
    data: {
      id: city.id.toString(),
      name: city.name,
      region: mapEnumToRegion(city.region),
      userCount: city._count.users
    }
  });
});

// Delete city
export const deleteCity = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({
      success: false,
      message: 'ID invalide'
    });
  }

  // Check if city exists
  const city = await prisma.city.findUnique({
    where: { id: Number(id) },
    include: {
      _count: {
        select: { users: true }
      }
    }
  });

  if (!city) {
    return res.status(404).json({
      success: false,
      message: 'Ville non trouvée'
    });
  }

  // Check if city has users
  if (city._count.users > 0) {
    return res.status(400).json({
      success: false,
      message: 'Impossible de supprimer une ville avec des utilisateurs'
    });
  }

  await prisma.city.delete({
    where: { id: Number(id) }
  });

  // Log the action
  await AuditService.logAction({
    userId: req.user?.id || null,
    action: 'CITY_DELETED',
    entityType: 'CITY',
    entityId: id,
    details: { name: city.name, region: city.region }
  });

  return res.json({
    success: true,
    message: 'Ville supprimée avec succès'
  });
});

// Get cities statistics
export const getCitiesStats = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  // Total number of regions in Tunisia (calculated from mapping)
  const TOTAL_REGIONS = Object.keys(ENUM_TO_REGION).length;

  const [total, byRegion, mostUsed] = await Promise.all([
    // Total cities
    prisma.city.count(),
    
    // Cities by region
    prisma.city.groupBy({
      by: ['region'],
      _count: { id: true }
    }).then((groups) => 
      groups.reduce((acc, group) => {
        acc[group.region] = group._count.id;
        return acc;
      }, {} as Record<string, number>)
    ),
    
    // Most used city
    prisma.city.findFirst({
      include: {
        _count: {
          select: { users: true }
        }
      },
      orderBy: {
        users: { _count: 'desc' }
      }
    }).then((city) => city ? {
      name: city.name,
      count: city._count.users
    } : { name: '', count: 0 })
  ]);

  return res.json({
    success: true,
    data: {
      total,
      byRegion,
      mostUsed,
      recentlyAdded: 0, // Placeholder since createdAt doesn't exist in City model
      totalRegions: TOTAL_REGIONS // Total number of regions in Tunisia
    }
  });
});

// Get cities by region (for dropdowns)
export const getCitiesByRegion = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { region } = req.params;

  if (!region) {
    return res.status(400).json({
      success: false,
      message: 'Région requise'
    });
  }

  const cities = await prisma.city.findMany({
    where: { region: region as any },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });

  return res.json({
    success: true,
    data: cities
  });
});