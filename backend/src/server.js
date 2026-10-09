const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketio = require('socket.io');
require('dotenv').config();

const { query, closePool } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter, authLimiter, paymentLimiter } = require('./middleware/rateLimiter');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const paymentRoutes = require('./routes/payments');
const { startScheduler, stopScheduler } = require('./services/scheduler');
const videoSocket = require('./socket/videoSocket');

// 1. Initialize Background Schedulers
startScheduler();

// 2. Allowed CORS Origins
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy: origin ${origin} is not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: corsOptions
});

// Initialize Socket logic
videoSocket(io);
app.set('io', io);

// 3. Security & Utility Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false // Allows WebRTC & dynamic assets cleanly
}));
app.use(cors(corsOptions));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// 4. Rate Limiting
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/payments', paymentLimiter);

// 5. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', require('./routes/patients'));
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/queue', require('./routes/queue'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/medicine', require('./routes/medicine'));

// 6. Detailed Health Check Endpoints
const handleHealthCheck = async (req, res) => {
  const healthStatus = {
    status: 'ok',
    uptime_seconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'checking',
      python_service: 'checking'
    }
  };

  // Test Database
  try {
    await query('SELECT 1');
    healthStatus.services.database = 'connected';
  } catch (err) {
    healthStatus.status = 'degraded';
    healthStatus.services.database = `disconnected: ${err.message}`;
  }

  // Test Python Microservice
  const pythonUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8001';
  try {
    const pyRes = await fetch(`${pythonUrl}/health`, { signal: AbortSignal.timeout(2000) });
    if (pyRes.ok) {
      healthStatus.services.python_service = 'connected';
    } else {
      healthStatus.services.python_service = `unhealthy: status ${pyRes.status}`;
    }
  } catch (err) {
    healthStatus.services.python_service = 'disconnected (medicine lookup unavailable)';
  }

  const statusCode = healthStatus.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(healthStatus);
};

app.get('/api/health', handleHealthCheck);
app.get('/health', handleHealthCheck);

app.get('/', (req, res) => {
  res.json({
    name: 'Healthcare Appointment System API',
    status: 'running',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// 7. Error Handling Middleware (must be after all routes)
app.use(errorHandler);

// 8. Server Listening
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[SERVER] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// 9. Graceful Shutdown Handlers
const handleGracefulShutdown = (signal) => {
  console.log(`\n[SHUTDOWN] Received ${signal}. Starting graceful shutdown...`);

  // Stop background cron jobs
  stopScheduler();

  // Stop accepting new connections on HTTP server
  server.close(async () => {
    console.log('[SHUTDOWN] HTTP and Socket server closed.');

    // Close Database Pool
    await closePool();

    console.log('[SHUTDOWN] Graceful shutdown completed. Exiting.');
    process.exit(0);
  });

  // Force close after 10 seconds if hanging
  setTimeout(() => {
    console.error('[SHUTDOWN] Force exiting after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  console.error(`[FATAL] Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = { app, server };
