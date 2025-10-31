import { io, Socket } from 'socket.io-client';

// Socket.IO client configuration
class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  // Initialize socket connection
  connect(token?: string): Socket {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    // Derive socket URL from API URL (remove /api suffix) or use environment variable
    const getSocketUrl = (): string => {
      // First check if explicit socket URL is provided
      if (process.env.NEXT_PUBLIC_SOCKET_URL) {
        return process.env.NEXT_PUBLIC_SOCKET_URL;
      }
      
      // Otherwise, derive from API URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://pharmacie-tn.onrender.com/api';
      
      // Remove /api suffix if present and return base URL
      if (apiUrl.endsWith('/api')) {
        return apiUrl.slice(0, -4); // Remove '/api'
      }
      
      // If no /api suffix, assume the API URL is already the base
      return apiUrl.replace('/api', '');
    };

    const SOCKET_URL = getSocketUrl();

    // Don't connect if no token is available
    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    if (!authToken) {
      console.warn('Socket connection skipped: No authentication token available');
      // Create a disconnected socket that won't attempt to connect
      // This prevents "Invalid namespace" errors from trying to connect without auth
      this.socket = io(SOCKET_URL, {
        auth: { token: null },
        autoConnect: false,
        transports: ['websocket', 'polling'],
      });
      // Immediately disconnect to prevent any connection attempts
      this.socket.disconnect();
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token: authToken,
      },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    // Connection event handlers
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      // Only log errors if we have a token (actual connection errors)
      // If no token, the error is expected and will be handled by the auth middleware
      const socketAuth = this.socket?.auth as { token?: string } | undefined;
      const hasToken = socketAuth?.token;
      if (hasToken) {
        console.error('Socket connection error:', error);
      } else {
        console.warn('Socket connection failed: No authentication token');
      }
      this.isConnected = false;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
    });

    return this.socket;
  }

  // Get current socket instance
  getSocket(): Socket | null {
    return this.socket;
  }

  // Check if socket is connected
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Emit event
  emit(event: string, data?: any): void {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, attempting to connect...');
      this.connect();
      // Retry emit after connection
      setTimeout(() => {
        if (this.socket && this.isConnected) {
          this.socket.emit(event, data);
        }
      }, 1000);
    }
  }

  // Listen to event
  on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove event listener
  off(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  // Join room
  joinRoom(room: string): void {
    this.emit('join-room', { room });
  }

  // Leave room
  leaveRoom(room: string): void {
    this.emit('leave-room', { room });
  }

  // Update authentication token
  updateAuth(token: string): void {
    if (this.socket) {
      this.socket.auth = { token };
      // Reconnect with new token
      this.socket.disconnect();
      this.socket.connect();
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

// Export singleton instance
export default socketService;

// Export types for better TypeScript support
export interface SocketEvents {
  // Notification events
  'notification:new': (notification: any) => void;
  'notification:update': (notification: any) => void;
  
  // Announcement events
  'announcement:new': (announcement: any) => void;
  'announcement:update': (announcement: any) => void;
  'announcement:delete': (announcementId: number) => void;
  
  // Request events
  'request:new': (request: any) => void;
  'request:update': (request: any) => void;
  'request:delete': (requestId: number) => void;
  
  // Interest events
  'interest:new': (interest: any) => void;
  'interest:update': (interest: any) => void;
  
  // Support events
  'support:new': (ticket: any) => void;
  'support:update': (ticket: any) => void;
  'support:reply': (reply: any) => void;
  
  // Retour events
  'retour:new': (retour: any) => void;
  'retour:update': (retour: any) => void;
  
  // System events
  'system:maintenance': (message: string) => void;
  'system:update': (message: string) => void;
}

// Hook for React components
export const useSocket = () => {
  return socketService;
}; 