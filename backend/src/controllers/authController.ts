import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { RoleType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma';
import { LoginCredentials, RegisterData } from '../types';
import { AuditService } from '../services/auditService';
import { PasswordValidation } from '../utils/passwordValidation';
import { EmailService } from '../services/emailService';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      cityName,
      regionName,
      role
    }: RegisterData = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      res.status(400).json({
        success: false,
        error: 'Name, email, password, and role are required'
      });
      return;
    }

    // Validate email format
    if (!PasswordValidation.validateEmail(email)) {
      res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
      return;
    }

    // Validate password
    const passwordValidation = PasswordValidation.validatePasswordComprehensive(password);
    if (!passwordValidation.isValid) {
      res.status(400).json({
        success: false,
        error: 'Password does not meet requirements',
        details: passwordValidation.errors
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
        error: 'User with this email already exists'
      });
      return;
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Get role
    const userRole = await prisma.role.findUnique({
      where: { name: role as RoleType }
    });

    if (!userRole) {
      res.status(400).json({
        success: false,
        error: 'Invalid role'
      });
      return;
    }

    // Handle city and region
    let cityId: number | undefined;
    
    if (cityName && regionName) {
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
    if (cityId !== undefined) {
      userData.cityId = cityId;
    }

    const user = await prisma.user.create({
      data: userData,
      include: {
        role: true,
        city: true
      }
    });

    // Log user registration
    await AuditService.logUserRegistration(user.id, {
      email: user.email,
      role: user.role.name,
      city: user.city
    });

    // Generate JWT token
    const jwtSecret = process.env['JWT_SECRET'];
    if (!jwtSecret) {
      res.status(500).json({
        success: false,
        error: 'JWT secret not configured'
      });
      return;
    }

    const token = jwt.sign(
      { userId: user.id },
      jwtSecret,
      { expiresIn: process.env['JWT_EXPIRES_IN'] || '7d' } as any
    );

    // Remove password hash from response
    const { passwordHash: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register user'
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginCredentials = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        city: true
      }
    });

    if (!user) {
      // Log failed login attempt
      await AuditService.logLoginFailed(email, req.ip);
      
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      // Log failed login attempt
      await AuditService.logLoginFailed(email, req.ip);
      
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
      return;
    }

    // Generate JWT token
    const jwtSecret = process.env['JWT_SECRET'];
    if (!jwtSecret) {
      res.status(500).json({
        success: false,
        error: 'JWT secret not configured'
      });
      return;
    }

    const token = jwt.sign(
      { userId: user.id },
      jwtSecret,
      { expiresIn: process.env['JWT_EXPIRES_IN'] || '7d' } as any
    );

    // Log user login with IP and user agent
    const { ipAddress, userAgent } = AuditService.getRequestInfo(req);
    await AuditService.logUserLogin(user.id, ipAddress, userAgent);

    // Remove password hash from response
    const { passwordHash: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to login'
    });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { passwordHash: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user data'
    });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        error: 'Email is required'
      });
      return;
    }

    // Validate email format
    if (!PasswordValidation.validateEmail(email)) {
      res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      res.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent'
      });
      return;
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // Send reset email
    const emailSent = await EmailService.sendPasswordResetEmail(
      user.email,
      resetToken,
      user.id
    );

    if (!emailSent) {
      res.status(500).json({
        success: false,
        error: 'Failed to send reset email'
      });
      return;
    }

    // Log password reset request
    await AuditService.logPasswordResetRequested(user.id, user.email);

    res.json({
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process password reset request'
    });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({
        success: false,
        error: 'Token and new password are required'
      });
      return;
    }

    // Validate password
    const passwordValidation = PasswordValidation.validatePasswordComprehensive(password);
    if (!passwordValidation.isValid) {
      res.status(400).json({
        success: false,
        error: 'Password does not meet requirements',
        details: passwordValidation.errors
      });
      return;
    }

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
      return;
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    // Send confirmation email
    await EmailService.sendPasswordResetConfirmation(user.email, user.id);

    // Log password changed
    await AuditService.logPasswordChanged(user.id, user.email);

    res.json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password'
    });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { name, email, phone, address, password } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!currentUser) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== currentUser.email) {
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
    }

    // Prepare update data
    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;

    // Handle password update
    if (password) {
      const passwordValidation = PasswordValidation.validatePasswordComprehensive(password);
      if (!passwordValidation.isValid) {
        res.status(400).json({
          success: false,
          error: 'Password does not meet requirements',
          details: passwordValidation.errors
        });
        return;
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        role: true,
        city: true
      }
    });

    // Log profile update
    const { ipAddress, userAgent } = AuditService.getRequestInfo(req);
    await AuditService.logAction({
      userId,
      action: 'PROFILE_UPDATE',
      entityType: 'USER',
      entityId: userId,
      ipAddress,
      userAgent,
      details: {
        message: 'Profile updated',
        changes: {
          name: name ? 'updated' : 'unchanged',
          email: email ? 'updated' : 'unchanged',
          phone: phone ? 'updated' : 'unchanged',
          address: address ? 'updated' : 'unchanged',
          password: password ? 'updated' : 'unchanged'
        }
      }
    });

    res.json({
      success: true,
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        role: updatedUser.role,
        city: updatedUser.city
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
};