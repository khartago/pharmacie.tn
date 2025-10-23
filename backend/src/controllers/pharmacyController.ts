import { Response } from 'express';
import { RoleType } from '@prisma/client';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../types';
import bcrypt from 'bcrypt';
import { PasswordGenerator } from '../utils/passwordGenerator';
import { EmailService } from '../services/emailService';

export const createPharmacy = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, address, cityId } = req.body;

    // Validate required fields
    if (!name || !email || !cityId) {
      res.status(400).json({
        success: false,
        error: 'Name, email, and city are required'
      });
      return;
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
      return;
    }

    // Get pharmacy role
    const pharmacyRole = await prisma.role.findUnique({
      where: { name: RoleType.PHARMACY }
    });

    if (!pharmacyRole) {
      res.status(500).json({
        success: false,
        error: 'Pharmacy role not found'
      });
      return;
    }

    // Generate secure password
    const generatedPassword = PasswordGenerator.generatePassword();
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(generatedPassword, saltRounds);

    // Create pharmacy
    const pharmacy = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone,
        address,
        cityId: parseInt(cityId),
        roleId: pharmacyRole.id,
        isActive: true
      },
      include: {
        city: true,
        role: true
      }
    });

    // Get city information for email
    const city = await prisma.city.findUnique({
      where: { id: parseInt(cityId) }
    });

    // Send welcome email
    const emailSent = await EmailService.sendWelcomeEmail(
      pharmacy.email,
      pharmacy.name,
      pharmacy.email,
      generatedPassword,
      'PHARMACY',
      city?.name || 'Ville inconnue'
    );

    // Remove password from response
    const { passwordHash: _, ...pharmacyWithoutPassword } = pharmacy;

    res.status(201).json({
      success: true,
      data: {
        user: pharmacyWithoutPassword,
        password: generatedPassword // Include password in response for admin reference
      },
      message: `Pharmacie créée avec succès. Un email de bienvenue ${emailSent ? 'a été envoyé' : 'n\'a pas pu être envoyé'} à ${pharmacy.email}.`
    });

  } catch (error) {
    console.error('Create pharmacy error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create pharmacy'
    });
  }
};

export const getPharmacies = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, city, region } = req.query as any;
    const skip = (page - 1) * limit;

    const where: any = {
      role: {
        name: RoleType.PHARMACY
      },
      isActive: true
    };

    if (city) {
      where.city = {
        name: {
          contains: city,
          mode: 'insensitive'
        }
      };
    }

    if (region) {
      where.city = {
        ...where.city,
        region: {
          name: {
            contains: region,
            mode: 'insensitive'
          }
        }
      };
    }

    const [pharmacies, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          city: true,
          role: true,
          subscriptions: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.user.count({ where })
    ]);

    // Remove password hash from response
    const pharmaciesWithoutPassword = pharmacies.map(({ passwordHash, ...pharmacy }) => pharmacy);

    res.json({
      success: true,
      data: {
        pharmacies: pharmaciesWithoutPassword,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get pharmacies error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get pharmacies'
    });
  }
};

export const getPharmacyById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Pharmacy ID is required'
      });
      return;
    }

    const pharmacy = await prisma.user.findFirst({
      where: {
        id,
        role: {
          name: RoleType.PHARMACY
        }
      },
      include: {
        city: true,
        role: true,
        subscriptions: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    if (!pharmacy) {
      res.status(404).json({
        success: false,
        error: 'Pharmacy not found'
      });
      return;
    }

    // Remove password hash from response
    const { passwordHash, ...pharmacyWithoutPassword } = pharmacy;

    res.json({
      success: true,
      data: pharmacyWithoutPassword
    });
  } catch (error) {
    console.error('Get pharmacy error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get pharmacy'
    });
  }
};

export const updatePharmacy = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, cityName, regionName } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Pharmacy ID is required'
      });
      return;
    }

    // Check if user can update this pharmacy
    if (req.user?.role.name !== RoleType.ADMIN && req.user?.id !== id) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    // Check if pharmacy exists
    const existingPharmacy = await prisma.user.findFirst({
      where: {
        id,
        role: {
          name: RoleType.PHARMACY
        }
      }
    });

    if (!existingPharmacy) {
      res.status(404).json({
        success: false,
        error: 'Pharmacy not found'
      });
      return;
    }

    // Handle city and region update
    let cityId = existingPharmacy.cityId;

    if (cityName && regionName) {
      // Find or create region
      // Convert region name to enum value
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

      const regionEnum = regionMap[regionName] || 'TUNIS';

              // Find or create city
        let city = await prisma.city.findFirst({
          where: {
            name: cityName,
            region: regionEnum as any
          }
        });

        if (!city) {
          city = await prisma.city.create({
            data: {
              name: cityName,
              region: regionEnum as any
            }
          });
        }

      cityId = city.id;
    }

    // Update pharmacy
    const updatedPharmacy = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(cityId && { cityId })
      },
             include: {
         city: true,
         role: true
       }
    });

    // Remove password hash from response
    const { passwordHash, ...pharmacyWithoutPassword } = updatedPharmacy;

    res.json({
      success: true,
      data: pharmacyWithoutPassword,
      message: 'Pharmacy updated successfully'
    });
  } catch (error) {
    console.error('Update pharmacy error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update pharmacy'
    });
  }
};

export const deactivatePharmacy = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Pharmacy ID is required'
      });
      return;
    }

    // Only admins can deactivate pharmacies
    if (req.user?.role.name !== RoleType.ADMIN) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    const pharmacy = await prisma.user.updateMany({
      where: {
        id,
        role: {
          name: RoleType.PHARMACY
        }
      },
      data: {
        isActive: false
      }
    });

    if (pharmacy.count === 0) {
      res.status(404).json({
        success: false,
        error: 'Pharmacy not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Pharmacy deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate pharmacy error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to deactivate pharmacy'
    });
  }
};

export const activatePharmacy = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Pharmacy ID is required'
      });
      return;
    }

    // Only admins can activate pharmacies
    if (req.user?.role.name !== RoleType.ADMIN) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    const pharmacy = await prisma.user.updateMany({
      where: {
        id,
        role: {
          name: RoleType.PHARMACY
        }
      },
      data: {
        isActive: true
      }
    });

    if (pharmacy.count === 0) {
      res.status(404).json({
        success: false,
        error: 'Pharmacy not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Pharmacy activated successfully'
    });
  } catch (error) {
    console.error('Activate pharmacy error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to activate pharmacy'
    });
  }
};

// Update pharmacy status (toggle isActive)
export const updatePharmacyStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Pharmacy ID is required'
      });
      return;
    }

    // Only admins can update pharmacy status
    if (req.user?.role.name !== RoleType.ADMIN) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    const pharmacy = await prisma.user.update({
      where: {
        id,
        role: {
          name: RoleType.PHARMACY
        }
      },
      data: {
        isActive: Boolean(isActive)
      },
      include: {
        city: true,
        role: true,
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    res.json({
      success: true,
      data: pharmacy
    });
  } catch (error) {
    console.error('Update pharmacy status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update pharmacy status'
    });
  }
};

// Create subscription for pharmacy
export const createSubscription = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { startDate, endDate, status } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Pharmacy ID is required'
      });
      return;
    }

    // Only admins can create subscriptions
    if (req.user?.role.name !== RoleType.ADMIN) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    // Validate required fields
    if (!startDate || !endDate || !status) {
      res.status(400).json({
        success: false,
        error: 'Start date, end date, and status are required'
      });
      return;
    }

    // Check if pharmacy exists
    const pharmacy = await prisma.user.findFirst({
      where: {
        id,
        role: {
          name: RoleType.PHARMACY
        }
      }
    });

    if (!pharmacy) {
      res.status(404).json({
        success: false,
        error: 'Pharmacy not found'
      });
      return;
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId: id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: status as 'TRIAL' | 'ACTIVE' | 'EXPIRED'
      }
    });

    res.status(201).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create subscription'
    });
  }
};

// Update subscription
export const updateSubscription = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id, subId } = req.params;
    const { endDate, status } = req.body;

    if (!id || !subId) {
      res.status(400).json({
        success: false,
        error: 'Pharmacy ID and subscription ID are required'
      });
      return;
    }

    // Only admins can update subscriptions
    if (req.user?.role.name !== RoleType.ADMIN) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    // Check if subscription exists and belongs to the pharmacy
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        id: parseInt(subId),
        userId: id
      }
    });

    if (!existingSubscription) {
      res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
      return;
    }

    const updateData: any = {};
    if (endDate) updateData.endDate = new Date(endDate);
    if (status) updateData.status = status;

    const subscription = await prisma.subscription.update({
      where: {
        id: parseInt(subId)
      },
      data: updateData
    });

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update subscription'
    });
  }
};