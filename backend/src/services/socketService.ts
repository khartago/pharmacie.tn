import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { AuthenticatedSocket } from '../types';

export class SocketService {
  private io: SocketIOServer | null = null;
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  initialize(server: HTTPServer): void {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: [
          process.env['FRONTEND_URL'] || "http://localhost:3000",
          'https://pharmacie-tn.onrender.com',
          'https://pharmacy-tn.netlify.app',
          'http://localhost:3000'
        ],
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth['token'];
        
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const jwtSecret = process.env['JWT_SECRET'];
        if (!jwtSecret) {
          return next(new Error('JWT secret not configured'));
        }

        const decoded = jwt.verify(token, jwtSecret) as { userId: string };
        socket.userId = decoded.userId;
        
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User ${socket.userId} connected`);
      
      // Store socket mapping - only if userId is defined
      if (socket.userId) {
        this.userSockets.set(socket.userId, socket.id);
        
        // Join user's personal room
        socket.join(`user:${socket.userId}`);

        socket.on('disconnect', () => {
          console.log(`User ${socket.userId} disconnected`);
          if (socket.userId) {
            this.userSockets.delete(socket.userId);
          }
        });
      }
    });

    console.log('✅ Socket.IO service initialized');
  }

  // Send notification to specific user
  sendToUser(userId: string, event: string, data: any): void {
    if (!this.io) return;
    
    this.io.to(`user:${userId}`).emit(event, data);
  }

  // Send notification to multiple users
  sendToUsers(userIds: string[], event: string, data: any): void {
    if (!this.io) return;
    
    userIds.forEach(userId => {
      this.io!.to(`user:${userId}`).emit(event, data);
    });
  }

  // Send to all connected clients
  broadcast(event: string, data: any): void {
    if (!this.io) return;
    
    this.io.emit(event, data);
  }

  // Send to room
  sendToRoom(room: string, event: string, data: any): void {
    if (!this.io) return;
    
    this.io.to(room).emit(event, data);
  }

  // Notification events
  notifyInterestExpressed(annonceId: string, userId: string, annonceOwnerId: string): void {
    this.sendToUser(annonceOwnerId, 'interest_expressed', {
      annonceId,
      userId,
      timestamp: new Date().toISOString()
    });
  }

  notifyInterestAccepted(annonceId: string, userId: string): void {
    this.sendToUser(userId, 'interest_accepted', {
      annonceId,
      timestamp: new Date().toISOString()
    });
  }

  notifyInterestRefused(annonceId: string, userId: string): void {
    this.sendToUser(userId, 'interest_refused', {
      annonceId,
      timestamp: new Date().toISOString()
    });
  }

  notifyRequestCreated(requestId: string, requestOwnerId: string, responderIds: string[]): void {
    this.sendToUsers(responderIds, 'request_created', {
      requestId,
      requestOwnerId,
      timestamp: new Date().toISOString()
    });
  }

  notifyRequestResponded(requestId: string, requestOwnerId: string, responderId: string): void {
    this.sendToUser(requestOwnerId, 'request_responded', {
      requestId,
      responderId,
      timestamp: new Date().toISOString()
    });
  }

  notifyRequestAccepted(requestId: string, responderId: string): void {
    this.sendToUser(responderId, 'request_accepted', {
      requestId,
      timestamp: new Date().toISOString()
    });
  }

  notifyRetourCreated(retourId: string, supplierId: string, pharmacyId: string): void {
    this.sendToUser(supplierId, 'retour_created', {
      retourId,
      pharmacyId,
      timestamp: new Date().toISOString()
    });
  }

  notifyRetourAccepted(retourId: string, pharmacyId: string): void {
    this.sendToUser(pharmacyId, 'retour_accepted', {
      retourId,
      timestamp: new Date().toISOString()
    });
  }

  notifyRetourRefused(retourId: string, pharmacyId: string): void {
    this.sendToUser(pharmacyId, 'retour_refused', {
      retourId,
      timestamp: new Date().toISOString()
    });
  }

  notifyExpiration(itemId: string, itemType: 'annonce' | 'request' | 'retour', userId: string): void {
    this.sendToUser(userId, 'item_expired', {
      itemId,
      itemType,
      timestamp: new Date().toISOString()
    });
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  // Check if user is connected
  isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId);
  }
}

export const socketService = new SocketService(); 