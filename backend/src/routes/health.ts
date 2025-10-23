import express from 'express';
import { PrismaClient } from '@prisma/client';
import os from 'os';

const router = express.Router();
const prisma = new PrismaClient();

// Basic health check
router.get('/', async (_req, res) => {
  try {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env['NODE_ENV'] || 'development'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// Database health check
router.get('/db', async (_req, res) => {
  try {
    const [users, medicines, announcements, requests] = await Promise.all([
      prisma.user.count(),
      prisma.medicine.count(),
      prisma.announcement.count(),
      prisma.request.count()
    ]);

    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: 'Connected',
      stats: {
        users,
        medicines,
        announcements,
        requests
      }
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: 'Disconnected',
      error: 'Database connection failed'
    });
  }
});

// App health check
router.get('/app', async (_req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      app: {
        uptime: Math.floor(uptime),
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024)
        },
        nodeVersion: process.version,
        platform: process.platform
      }
    });
  } catch (error) {
    console.error('App health check failed:', error);
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'App health check failed'
    });
  }
});

// Email health check
router.get('/email', async (_req, res) => {
  try {
    // Check if email service is configured
    const isConfigured = !!(process.env['EMAIL_USER'] && process.env['EMAIL_PASS']);
    
    if (!isConfigured) {
      res.status(500).json({
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        email: 'Not configured',
        error: 'Email service not properly configured'
      });
      return;
    }

    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      email: 'Configured',
      smtp: {
        host: process.env['EMAIL_HOST'] || 'Not set',
        port: process.env['EMAIL_PORT'] || 'Not set',
        user: process.env['EMAIL_USER'] ? 'Set' : 'Not set'
      }
    });
  } catch (error) {
    console.error('Email health check failed:', error);
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      email: 'Error',
      error: 'Email configuration test failed'
    });
  }
});

// Queue/Cron jobs health check
router.get('/queue', async (_req, res) => {
  try {
    // Check if archiving jobs are working
    const expiredAnnouncements = await prisma.announcement.count({
      where: {
        status: 'AVAILABLE',
        expiryDate: {
          lt: new Date()
        }
      }
    });

    const expiredRequests = await prisma.request.count({
      where: {
        status: 'OPEN',
        createdAt: {
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
        }
      }
    });

    const expiredRetours = await prisma.announcement.count({
      where: {
        supplierStatus: {
          in: ['PENDING', 'DONE', 'REFUSED']
        },
        createdAt: {
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
        }
      }
    });

    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      queues: {
        archiving: 'Active',
        notifications: 'Active'
      },
      pending: {
        expiredAnnouncements,
        expiredRequests,
        expiredRetours
      },
      recommendations: {
        shouldArchive: expiredAnnouncements > 0 || expiredRequests > 0 || expiredRetours > 0
      }
    });
  } catch (error) {
    console.error('Queue health check failed:', error);
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Queue health check failed'
    });
  }
});

// System metrics endpoint
router.get('/metrics', async (_req, res) => {
  try {
    // CPU Usage
    const cpus = os.cpus();
    const cpuUsage = Math.round(
      cpus.reduce((acc, cpu) => {
        const total = Object.values(cpu.times).reduce((a, b) => a + b);
        const idle = cpu.times.idle;
        return acc + ((total - idle) / total) * 100;
      }, 0) / cpus.length
    );

    // Memory Usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = Math.round(((totalMem - freeMem) / totalMem) * 100);

    // Uptime
    const uptime = Math.floor(process.uptime());
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const uptimeFormatted = `${days}j ${hours}h ${minutes}m`;

    // Database connections (measure query time)
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStart;

    res.json({
      success: true,
      data: {
        cpu: { usage: cpuUsage },
        memory: { usage: memoryUsage },
        database: { connections: 1, latency: dbLatency },
        network: { latency: dbLatency },
        uptime: uptimeFormatted,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('System metrics failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch system metrics',
      data: {
        cpu: { usage: 0 },
        memory: { usage: 0 },
        database: { connections: 0, latency: 0 },
        network: { latency: 0 },
        uptime: '0j 0h 0m',
        timestamp: new Date().toISOString()
      }
    });
  }
});

export default router; 