import { Response } from 'express';
import bcrypt from 'bcrypt';
import { RoleType } from '@prisma/client';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../types';
import { AuditService } from '../services/auditService';
import { EmailService } from '../services/emailService';
import { PasswordGenerator } from '../utils/passwordGenerator';

export interface CreateAccountData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  cityName?: string;
  regionName?: string;
  cityId?: number;
  role: RoleType;
}

export const createAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Only admins can create accounts
    if (req.user?.role.name !== RoleType.ADMIN) {
      res.status(403).json({
        success: false,
        error: 'Accès refusé. Seuls les administrateurs peuvent créer des comptes.'
      });
      return;
    }

    const {
      name,
      email,
      phone,
      address,
      cityName,
      regionName,
      cityId,
      role
    }: CreateAccountData = req.body;

    // Validate required fields
    if (!name || !email || !role) {
      res.status(400).json({
        success: false,
        error: 'Le nom, l\'email et le rôle sont obligatoires'
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: 'Format d\'email invalide'
      });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'Un utilisateur avec cet email existe déjà'
      });
      return;
    }

    // Generate secure password
    const generatedPassword = PasswordGenerator.generatePassword();
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(generatedPassword, saltRounds);

    // Get role
    const userRole = await prisma.role.findUnique({
      where: { name: role }
    });

    if (!userRole) {
      res.status(400).json({
        success: false,
        error: 'Rôle invalide'
      });
      return;
    }

    // Handle city and region
    let finalCityId: number | undefined;
    
    // If cityId is provided directly, use it
    if (cityId) {
      finalCityId = cityId;
    } else if (cityName && regionName) {
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

      finalCityId = city.id;
    }

    // Create user
    const userData: any = {
      name,
      email,
      passwordHash,
      roleId: userRole.id
    };

    // Only add optional fields if they are defined
    if (phone !== undefined) {
      userData.phone = phone;
    }
    if (address !== undefined) {
      userData.address = address;
    }
    if (finalCityId !== undefined) {
      userData.cityId = finalCityId;
    }

    const user = await prisma.user.create({
      data: userData,
      include: {
        role: true,
        city: true
      }
    });

    // Log account creation
    await AuditService.logAccountCreated(req.user.id, user.id, {
      email: user.email,
      role: user.role.name,
      city: user.city
    });

    // Send welcome email
    const emailSent = await EmailService.sendWelcomeEmail(
      user.email,
      user.name,
      user.email,
      generatedPassword,
      user.role.name,
      user.id
    );

    if (emailSent) {
      await AuditService.logWelcomeEmailSent(user.id, user.email);
    }

    // Remove password hash from response
    const { passwordHash: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      data: {
        user: userWithoutPassword,
        password: generatedPassword // Include password in response for admin reference
      },
      message: `Compte ${role === 'PHARMACY' ? 'pharmacie' : role === 'SUPPLIER' ? 'fournisseur' : 'administrateur'} créé avec succès. Un email de bienvenue a été envoyé.`
    });
  } catch (error) {
    console.error('Erreur lors de la création du compte:', error);
    res.status(500).json({
      success: false,
      error: 'Échec de la création du compte'
    });
  }
};

export const getAccountStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Only admins can view stats
    if (req.user?.role.name !== RoleType.ADMIN) {
      res.status(403).json({
        success: false,
        error: 'Accès refusé. Seuls les administrateurs peuvent consulter les statistiques.'
      });
      return;
    }

    const [totalUsers, byRole, activeUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({
        by: ['roleId'],
        _count: {
          roleId: true
        }
      }),
      prisma.user.count({
        where: { isActive: true }
      })
    ]);

    // Get role names for the stats
    const roles = await prisma.role.findMany();
    const roleStats = byRole.reduce((acc, item) => {
      const role = roles.find(r => r.id === item.roleId);
      if (role) {
        acc[role.name] = item._count.roleId;
      }
      return acc;
    }, {} as Record<string, number>);

    res.json({
      success: true,
      data: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        byRole: roleStats
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      error: 'Échec de la récupération des statistiques'
    });
  }
};

// Get all pharmacies (users with PHARMACY role)
export const getPharmacies = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Only admins can access this
    if (req.user?.role.name !== RoleType.ADMIN) {
      res.status(403).json({
        success: false,
        error: 'Accès refusé. Seuls les administrateurs peuvent accéder à cette ressource.'
      });
      return;
    }

    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const whereClause: any = {
      role: {
        name: RoleType.PHARMACY
      }
    };

    if (status && status !== 'all') {
      whereClause.isActive = status === 'active';
    }

    const [pharmacies, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: {
          role: true,
          city: true
        },
        skip,
        take: Number(limit),
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.user.count({
        where: whereClause
      })
    ]);

    res.json({
      success: true,
      data: {
        data: pharmacies,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des pharmacies:', error);
    res.status(500).json({
      success: false,
      error: 'Échec de la récupération des pharmacies'
    });
  }
};

// Get all suppliers (users with SUPPLIER role)
export const getSuppliers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Only admins can access this
    if (req.user?.role.name !== RoleType.ADMIN) {
      res.status(403).json({
        success: false,
        error: 'Accès refusé. Seuls les administrateurs peuvent accéder à cette ressource.'
      });
      return;
    }

    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const whereClause: any = {
      role: {
        name: RoleType.SUPPLIER
      }
    };

    if (status && status !== 'all') {
      whereClause.isActive = status === 'active';
    }

    const [suppliers, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: {
          role: true,
          city: true
        },
        skip,
        take: Number(limit),
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.user.count({
        where: whereClause
      })
    ]);

    res.json({
      success: true,
      data: {
        data: suppliers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des fournisseurs:', error);
    res.status(500).json({
      success: false,
      error: 'Échec de la récupération des fournisseurs'
    });
  }
};

// Update account
export const updateAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Only admins can update accounts
    if (req.user?.role.name !== RoleType.ADMIN) {
      res.status(403).json({
        success: false,
        error: 'Accès refusé. Seuls les administrateurs peuvent modifier des comptes.'
      });
      return;
    }

    const { id } = req.params;
    const {
      name,
      email,
      phone,
      address,
      cityId,
      isActive
    } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ID utilisateur requis'
      });
      return;
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: { role: true }
    });

    if (!existingUser) {
      res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
      return;
    }

    // Prepare update data
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (cityId !== undefined) updateData.cityId = cityId;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        role: true,
        city: true
      }
    });

    // Log the action
    const { ipAddress, userAgent } = AuditService.getRequestInfo(req);
    await AuditService.logAction({
      userId: req.user?.id,
      action: `UPDATE_ACCOUNT`,
      entityType: 'User',
      entityId: id,
      ipAddress,
      userAgent,
      details: {
        targetUser: existingUser.email,
        changes: updateData
      }
    });

    // Remove password hash from response
    const { passwordHash: _, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      data: userWithoutPassword,
      message: 'Compte modifié avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la modification du compte:', error);
    res.status(500).json({
      success: false,
      error: 'Échec de la modification du compte'
    });
  }
};

// Update account status
export const updateAccountStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Only admins can update account status
    if (req.user?.role.name !== RoleType.ADMIN) {
      res.status(403).json({
        success: false,
        error: 'Accès refusé. Seuls les administrateurs peuvent modifier le statut des comptes.'
      });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ID utilisateur requis'
      });
      return;
    }

    if (!status || !['active', 'inactive'].includes(status)) {
      res.status(400).json({
        success: false,
        error: 'Statut invalide. Utilisez "active" ou "inactive".'
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: { role: true }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: status === 'active'
      },
      include: {
        role: true,
        city: true
      }
    });

    // Log the action
    const { ipAddress, userAgent } = AuditService.getRequestInfo(req);
    await AuditService.logAction({
      userId: req.user?.id,
      action: `UPDATE_ACCOUNT_STATUS`,
      entityType: 'User',
      entityId: id,
      ipAddress,
      userAgent,
      details: {
        oldStatus: user.isActive ? 'active' : 'inactive',
        newStatus: status,
        targetUser: user.email
      }
    });

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({
      success: false,
      error: 'Échec de la mise à jour du statut'
    });
  }
};

// Delete account
export const deleteAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Only admins can delete accounts
    if (req.user?.role.name !== RoleType.ADMIN) {
      res.status(403).json({
        success: false,
        error: 'Accès refusé. Seuls les administrateurs peuvent supprimer des comptes.'
      });
      return;
    }

    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ID utilisateur requis'
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: { role: true }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
      return;
    }

    // Prevent deletion of admin accounts
    if (user.role.name === RoleType.ADMIN) {
      res.status(400).json({
        success: false,
        error: 'Impossible de supprimer un compte administrateur'
      });
      return;
    }

    // Log the action before deletion
    const { ipAddress, userAgent } = AuditService.getRequestInfo(req);
    await AuditService.logAction({
      userId: req.user?.id,
      action: `DELETE_ACCOUNT`,
      entityType: 'User',
      entityId: id,
      ipAddress,
      userAgent,
      details: {
        deletedUser: user.email,
        userRole: user.role.name
      }
    });

    await prisma.user.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Compte supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du compte:', error);
    res.status(500).json({
      success: false,
      error: 'Échec de la suppression du compte'
    });
  }
}; 