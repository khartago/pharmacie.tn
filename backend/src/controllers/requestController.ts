import { Response } from 'express';
import { RequestResponseStatus, RoleType } from '@prisma/client';
import prisma from '../lib/prisma';
import { AuthenticatedRequest, CreateRequestData } from '../types';
import { NotificationService } from '../services/notificationService';
import { AuditService } from '../services/auditService';

export const getRequests = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 21, status, medicineId, scope, cityId, regionName } = req.query as any;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by medicine
    if (medicineId) {
      where.medicineId = parseInt(medicineId);
    }

    // Filter by scope
    if (scope) {
      where.scope = scope;
    }

    // Filter by city (for CITY scope)
    if (cityId) {
      where.cities = {
        array_contains: [parseInt(cityId)]
      };
    }

    // Filter by region (for REGION scope)
    if (regionName) {
      where.regions = {
        array_contains: [regionName]
      };
    }

    // Filter requests based on user role and scope
    if (req.user?.role.name === RoleType.ADMIN) {
      // Admins can see all requests
    } else if (req.user?.role.name === RoleType.PHARMACY) {
      // Pharmacies can see requests relevant to their location
      const userCity = req.user.city;
      if (userCity) {
        where.OR = [
          // Requests for all Tunisia
          { scope: 'ALL_TUNISIA' },
          // Requests for their region
          {
            scope: 'REGION',
            regions: {
              array_contains: [userCity.region]
            }
          },
          // Requests for their city
          {
            scope: 'CITY',
            cities: {
              array_contains: [userCity.id]
            }
          }
        ];
      }
    } else {
      // Other users see only their own requests
      where.userId = req.user!.id;
    }

    const [requests, total] = await Promise.all([
      prisma.request.findMany({
        where,
        include: {
          medicine: true,
                     user: {
             select: {
               id: true,
               name: true,
               phone: true,
               city: true
                           }
            },
            responses: {
              include: {
                pharmacyUser: {
                  select: {
                    id: true,
                    name: true,
                    phone: true,
                    city: true
                  }
                }
              },
            orderBy: {
              createdAt: 'desc'
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.request.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get requests'
    });
  }
};

export const getRequestById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Request ID is required'
      });
      return;
    }

    const request = await prisma.request.findUnique({
      where: { id: parseInt(id) },
      include: {
        medicine: true,
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            city: true
          }
        },
        responses: {
          include: {
            pharmacyUser: {
              select: {
                id: true,
                name: true,
                phone: true,
                address: true,
                city: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!request) {
      res.status(404).json({
        success: false,
        error: 'Request not found'
      });
      return;
    }

    // Check permissions - only admin, request owner, or pharmacies in same region can view
    if (req.user?.role.name !== RoleType.ADMIN && 
        request.userId !== req.user?.id &&
        !(req.user?.role.name === RoleType.PHARMACY && req.user?.city?.region === request.region)) {
      res.status(403).json({
        success: false,
        error: 'Access denied'
      });
      return;
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get request'
    });
  }
};

export const createRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { medicineId, quantity, scope, cities, regions }: CreateRequestData = req.body;

    // Validate required fields
    if (!medicineId || !quantity || !scope) {
      res.status(400).json({
        success: false,
        error: 'Medicine ID, quantity, and scope are required'
      });
      return;
    }

    // Validate scope-specific fields
    if (scope === 'CITY' && (!cities || cities.length === 0)) {
      res.status(400).json({
        success: false,
        error: 'Cities are required for CITY scope'
      });
      return;
    }

    if (scope === 'REGION' && (!regions || regions.length === 0)) {
      res.status(400).json({
        success: false,
        error: 'Regions are required for REGION scope'
      });
      return;
    }

    // Verify medicine exists
    const medicine = await prisma.medicine.findUnique({
      where: { id: medicineId }
    });

    if (!medicine) {
      res.status(404).json({
        success: false,
        error: 'Medicine not found'
      });
      return;
    }


    const requestData: any = {
      medicineId,
      quantity,
      scope: scope as any,
      userId: req.user!.id
    };

    if (scope === 'CITY' && cities) {
      requestData.cities = cities;
    } else if (scope === 'REGION' && regions) {
      requestData.regions = regions;
    }

    const request = await prisma.request.create({
      data: requestData,
      include: {
        medicine: true,
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            city: true
          }
        }
      }
    });

    // Log request creation
    await AuditService.logRequestCreated(req.user!.id, request.id, {
      medicineId,
      quantity,
      scope,
      cities,
      regions
    });

    // Notify all pharmacies in the same region
    await NotificationService.notifyRequestCreated(request.id);

    res.status(201).json({
      success: true,
      data: request,
      message: 'Request created successfully'
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create request'
    });
  }
};

export const updateRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantity, region } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Request ID is required'
      });
      return;
    }

    const request = await prisma.request.findUnique({
      where: { id: parseInt(id) }
    });

    if (!request) {
      res.status(404).json({
        success: false,
        error: 'Request not found'
      });
      return;
    }

    // Check permissions - only admin or request owner can update
    if (req.user?.role.name !== RoleType.ADMIN && request.userId !== req.user?.id) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    const updatedRequest = await prisma.request.update({
      where: { id: parseInt(id) },
      data: {
        ...(quantity && { quantity }),
        ...(region && { region })
      },
      include: {
        medicine: true,
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            city: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedRequest,
      message: 'Request updated successfully'
    });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update request'
    });
  }
};

export const deleteRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Request ID is required'
      });
      return;
    }

    const request = await prisma.request.findUnique({
      where: { id: parseInt(id) }
    });

    if (!request) {
      res.status(404).json({
        success: false,
        error: 'Request not found'
      });
      return;
    }

    // Check permissions - only admin or request owner can delete
    if (req.user?.role.name !== RoleType.ADMIN && request.userId !== req.user?.id) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    await prisma.request.delete({
      where: { id: parseInt(id) }
    });

    // Log request deletion
    await AuditService.logRequestDeleted(req.user!.id, parseInt(id));

    res.json({
      success: true,
      message: 'Request deleted successfully'
    });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete request'
    });
  }
};

// Request Response management
export const respondToRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // Plus besoin de status - on accepte directement

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Request ID is required'
      });
      return;
    }

    // Only pharmacies can respond to requests
    if (req.user?.role.name !== RoleType.PHARMACY) {
      res.status(403).json({
        success: false,
        error: 'Only pharmacies can respond to requests'
      });
      return;
    }

    const request = await prisma.request.findUnique({
      where: { id: parseInt(id) }
    });

    if (!request) {
      res.status(404).json({
        success: false,
        error: 'Request not found'
      });
      return;
    }

    // Check if response already exists
    const existingResponse = await prisma.requestResponse.findUnique({
      where: {
        requestId_pharmacyUserId: {
          requestId: parseInt(id),
          pharmacyUserId: req.user.id
        }
      }
    });

    if (existingResponse) {
      res.status(400).json({
        success: false,
        error: 'You have already responded to this request'
      });
      return;
    }

    const response = await prisma.requestResponse.create({
      data: {
        requestId: parseInt(id),
        pharmacyUserId: req.user.id,
        status: 'ACCEPTED'  // Toujours ACCEPTED directement
      },
      include: {
        pharmacyUser: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            city: true
          }
        }
      }
    });

    // Log request response
    await AuditService.logRequestResponded(req.user.id, response.id, parseInt(id));

    // Notify request owner
    await NotificationService.notifyRequestResponse(parseInt(id));

    res.status(201).json({
      success: true,
      data: response,
      message: 'Response sent successfully'
    });
  } catch (error) {
    console.error('Respond to request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to respond to request'
    });
  }
};

export const updateResponseStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id, responseId } = req.params;
    const { status } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Request ID is required'
      });
      return;
    }

    if (!responseId) {
      res.status(400).json({
        success: false,
        error: 'Response ID is required'
      });
      return;
    }

    if (!Object.values(RequestResponseStatus).includes(status)) {
      res.status(400).json({
        success: false,
        error: 'Invalid response status'
      });
      return;
    }

    const request = await prisma.request.findUnique({
      where: { id: parseInt(id) }
    });

    if (!request) {
      res.status(404).json({
        success: false,
        error: 'Request not found'
      });
      return;
    }

    // Only request owner or admin can update response status
    if (request.userId !== req.user?.id && req.user?.role.name !== RoleType.ADMIN) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    const updatedResponse = await prisma.requestResponse.update({
      where: { id: parseInt(responseId) },
      data: { status },
      include: {
        request: {
          include: {
            medicine: true
          }
        },
        pharmacyUser: {
          select: {
            id: true,
            name: true,
            phone: true,
            city: true
          }
        }
      }
    });

    // Log response status update
    if (status === 'ACCEPTED') {
      await AuditService.logRequestAccepted(req.user!.id, parseInt(responseId), parseInt(id));
      // Notify responding pharmacy that their response was accepted
      await NotificationService.notifyResponseAccepted(parseInt(responseId));
    }

    res.json({
      success: true,
      data: updatedResponse,
      message: 'Response status updated successfully'
    });
  } catch (error) {
    console.error('Update response status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update response status'
    });
  }
};

// Get my responses (where I responded to requests)
export const markRequestAsCompleted = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Request ID is required'
      });
      return;
    }

    const request = await prisma.request.findUnique({
      where: { id: parseInt(id) },
      include: {
        responses: {
          where: {
            pharmacyUserId: req.user!.id
          }
        }
      }
    });

    if (!request) {
      res.status(404).json({
        success: false,
        error: 'Request not found'
      });
      return;
    }

    // Vérifier que l'utilisateur est soit le demandeur soit un répondant
    const isRequester = request.userId === req.user!.id;
    const isResponder = request.responses.length > 0;

    if (!isRequester && !isResponder) {
      res.status(403).json({
        success: false,
        error: 'You can only mark as completed requests you created or responded to'
      });
      return;
    }

    // Marquer comme terminé
    const updatedRequest = await prisma.request.update({
      where: { id: parseInt(id) },
      data: {
        status: 'CLOSED'
      }
    });

    // Log the action
    await AuditService.logRequestUpdated(req.user!.id, parseInt(id), { status: 'CLOSED' });

    res.json({
      success: true,
      data: updatedRequest
    });
  } catch (error) {
    console.error('Mark request as completed error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark request as completed'
    });
  }
};

export const getMyResponses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 21, status } = req.query as any;
    const skip = (page - 1) * limit;

    const where: any = {
      pharmacyUserId: req.user!.id
    };

    // Filter by response status
    if (status) {
      where.status = status;
    }

    const [responses, total] = await Promise.all([
      prisma.requestResponse.findMany({
        where,
        include: {
          request: {
            include: {
              medicine: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  city: true
                }
              }
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.requestResponse.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        responses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get my responses error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get my responses'
    });
  }
};