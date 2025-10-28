import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import prisma from './lib/prisma';
import { errorHandler } from './middleware/errorHandler';
import { CronService } from './services/cronService';
import { EmailService } from './services/emailService';
import { socketService } from './services/socketService';
import { securityHeaders, corsOptions, apiRateLimit } from './middleware/security';

// Import routes
import authRoutes from './routes/auth';
import pharmacyRoutes from './routes/pharmacies';
import medicineRoutes from './routes/medicines';
import adminMedicineRoutes from './routes/adminMedicines';
import adminRoutes from './routes/admin';
import announcementRoutes from './routes/announcements';
import requestRoutes from './routes/requests';
import notificationRoutes from './routes/notifications';
import supportRoutes from './routes/support';
import analyticsRoutes from './routes/analytics';
import exportRoutes from './routes/export';
import archiveRoutes from './routes/archive';
import healthRoutes from './routes/health';
import auditRoutes from './routes/audit';
import cityRoutes from './routes/cities';
import publicCityRoutes from './routes/publicCities';
import supplierRoutes from './routes/suppliers';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env['PORT'] || 3000;

// Trust proxy configuration for production deployment
if (process.env['NODE_ENV'] === 'production') {
  // Trust first proxy (for Render.com and similar platforms)
  app.set('trust proxy', 1);
} else {
  // Disable trust proxy in development
  app.set('trust proxy', false);
}

// Initialize Socket.IO
socketService.initialize(server);

// Security middleware
app.use(securityHeaders);
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting - apply to all routes
app.use(apiRateLimit);

// Routes
app.get('/', (_req, res) => {
  res.json({ message: 'Pharmacie.tn backend running' });
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Database health check endpoint
app.get('/health/db', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'OK', database: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', database: 'disconnected', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/admin/medicines', adminMedicineRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/archive', archiveRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/admin/cities', cityRoutes);
app.use('/api/cities', publicCityRoutes);
app.use('/api/suppliers', supplierRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
server.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 Pharmacie.tn backend running`);
  
  try {
    // Initialize email service
    await EmailService.initialize();
    
    // Initialize cron jobs
    CronService.initCronJobs();
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  CronService.stopCronJobs();
  await prisma.$disconnect();
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  CronService.stopCronJobs();
  await prisma.$disconnect();
  server.close(() => {
    console.log('Process terminated');
  });
}); 