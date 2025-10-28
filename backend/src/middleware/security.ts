import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Rate limiting configuration - frontend-friendly
export const createRateLimit = (windowMs: number = 15 * 60 * 1000, max: number = 100) => {
  return rateLimit({
    windowMs, // 15 minutes by default
    max, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Trop de requêtes. Veuillez patienter un moment.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Skip successful requests to avoid counting successful responses
    skipSuccessfulRequests: false,
    // Skip failed requests to avoid counting failed responses
    skipFailedRequests: false,
    handler: (_req, res) => {
      res.status(429).json({
        error: 'Trop de requêtes. Veuillez patienter un moment.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Different rate limits for different endpoints
export const authRateLimit = createRateLimit(15 * 60 * 1000, 5); // 5 attempts per 15 minutes for auth
export const apiRateLimit = createRateLimit(15 * 60 * 1000, 100); // 100 requests per 15 minutes for general API
export const uploadRateLimit = createRateLimit(15 * 60 * 1000, 10); // 10 uploads per 15 minutes

// Security headers configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for your frontend
      scriptSrc: ["'self'"], // Allow scripts from same origin
      imgSrc: ["'self'", "data:", "https:"], // Allow images from same origin, data URLs, and HTTPS
      connectSrc: ["'self'"], // Allow connections to same origin
      fontSrc: ["'self'", "https:"], // Allow fonts from same origin and HTTPS
      objectSrc: ["'none'"], // Block object/embed
      mediaSrc: ["'self'"], // Allow media from same origin
      frameSrc: ["'none'"], // Block iframes
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for development
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resources
});

// CORS configuration for your frontend
export const corsOptions = {
  origin: [
    process.env['FRONTEND_URL'] || 'http://localhost:3000',
    'https://pharmacie-tn.onrender.com', // Production frontend URL
    'https://pharmacie-tn.netlify.app',  // Alternative deployment URL
    'https://pharmacy-tn.netlify.app',   // Actual Netlify deployment URL
    'http://localhost:3000'              // Development URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset']
}; 