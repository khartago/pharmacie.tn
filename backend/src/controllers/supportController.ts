import { Response } from 'express';
import { SupportTicketStatus, RoleType } from '@prisma/client';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../types';
import { EmailService } from '../services/emailService';
import { AuditService } from '../services/auditService';

export const getSupportTickets = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status } = req.query as any;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Show only user's own tickets if not admin
    if (req.user?.role.name !== RoleType.ADMIN) {
      where.userId = req.user!.id;
    }

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: {
                select: {
                  name: true
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
      prisma.supportTicket.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        tickets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get support tickets error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get support tickets'
    });
  }
};

export const getSupportTicketById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Support ticket ID is required'
      });
      return;
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            role: {
              select: {
                name: true
              }
            },
            city: true
          }
        }
      }
    });

    if (!ticket) {
      res.status(404).json({
        success: false,
        error: 'Support ticket not found'
      });
      return;
    }

    // Check permissions - only admin or ticket owner can view
    if (req.user?.role.name !== RoleType.ADMIN && ticket.userId !== req.user?.id) {
      res.status(403).json({
        success: false,
        error: 'Access denied'
      });
      return;
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Get support ticket error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get support ticket'
    });
  }
};

export const createSupportTicket = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { subject, message } = req.body;

    // Validate required fields
    if (!subject || !message) {
      res.status(400).json({
        success: false,
        error: 'Subject and message are required'
      });
      return;
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        subject,
        message,
        userId: req.user!.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    // Send confirmation email
    await EmailService.sendSupportTicketConfirmation(
      ticket.user.email,
      ticket.user.name,
      ticket.id.toString(),
      ticket.subject,
      ticket.userId
    );

    // Log ticket creation
    await AuditService.logAction({
      userId: req.user!.id,
      action: 'SUPPORT_TICKET_CREATED',
      entityType: 'SUPPORT_TICKET',
      entityId: ticket.id.toString(),
      details: { subject, ticketId: ticket.id }
    });

    res.status(201).json({
      success: true,
      data: ticket,
      message: 'Support ticket created successfully'
    });
  } catch (error) {
    console.error('Create support ticket error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create support ticket'
    });
  }
};

export const updateSupportTicket = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Support ticket ID is required'
      });
      return;
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: parseInt(id) }
    });

    if (!ticket) {
      res.status(404).json({
        success: false,
        error: 'Support ticket not found'
      });
      return;
    }

    // Only admin or ticket owner can update
    if (req.user?.role.name !== RoleType.ADMIN && ticket.userId !== req.user?.id) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedTicket,
      message: 'Support ticket updated successfully'
    });
  } catch (error) {
    console.error('Update support ticket error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update support ticket'
    });
  }
};

export const deleteSupportTicket = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Support ticket ID is required'
      });
      return;
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: parseInt(id) }
    });

    if (!ticket) {
      res.status(404).json({
        success: false,
        error: 'Support ticket not found'
      });
      return;
    }

    // Only admin or ticket owner can delete
    if (req.user?.role.name !== RoleType.ADMIN && ticket.userId !== req.user?.id) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    await prisma.supportTicket.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Support ticket deleted successfully'
    });
  } catch (error) {
    console.error('Delete support ticket error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete support ticket'
    });
  }
};

export const getSupportTicketStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Only admins can view statistics
    if (req.user?.role.name !== RoleType.ADMIN) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    const [total, byStatus, recentTickets] = await Promise.all([
      prisma.supportTicket.count(),
      prisma.supportTicket.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      }),
      prisma.supportTicket.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      })
    ]);

    const statusStats = byStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      success: true,
      data: {
        total,
        byStatus: statusStats,
        recentTickets
      }
    });
  } catch (error) {
    console.error('Get support ticket stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get support ticket statistics'
    });
  }
};

export const replyToSupportTicket = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { replyMessage } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Support ticket ID is required'
      });
      return;
    }

    if (!replyMessage) {
      res.status(400).json({
        success: false,
        error: 'Reply message is required'
      });
      return;
    }

    // Only admins can reply to tickets
    if (req.user?.role.name !== RoleType.ADMIN) {
      res.status(403).json({
        success: false,
        error: 'Only admins can reply to support tickets'
      });
      return;
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!ticket) {
      res.status(404).json({
        success: false,
        error: 'Support ticket not found'
      });
      return;
    }

    // Update ticket with reply and change status to IN_PROGRESS
    const updatedTicket = await prisma.supportTicket.update({
      where: { id: parseInt(id) },
      data: {
        message: `${ticket.message}\n\n--- Admin Reply ---\n${replyMessage}`,
        status: SupportTicketStatus.IN_PROGRESS
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Send reply email to user
    await EmailService.sendSupportTicketReply(
      ticket.user.email,
      ticket.user.name,
      ticket.id.toString(),
      replyMessage,
      req.user!.id
    );

    // Log admin reply
    await AuditService.logAction({
      userId: req.user!.id,
      action: 'SUPPORT_TICKET_REPLIED',
      entityType: 'SUPPORT_TICKET',
      entityId: ticket.id.toString(),
      details: { 
        ticketId: ticket.id,
        userEmail: ticket.user.email,
        replyLength: replyMessage.length
      }
    });

    res.json({
      success: true,
      data: updatedTicket,
      message: 'Reply sent successfully'
    });
  } catch (error) {
    console.error('Reply to support ticket error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send reply'
    });
  }
};

export const getSupportTicketResponses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Support ticket ID is required'
      });
      return;
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!ticket) {
      res.status(404).json({
        success: false,
        error: 'Support ticket not found'
      });
      return;
    }

    // Only admin or ticket owner can view responses
    if (req.user?.role.name !== RoleType.ADMIN && ticket.userId !== req.user?.id) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Get support ticket responses error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get support ticket responses'
    });
  }
};