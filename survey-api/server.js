require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./config/db');
const swaggerSpec = require('./config/swagger');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const surveyRoutes = require('./routes/surveys');
const adminRoutes = require('./routes/admin');

// Connect to Database
connectDB();

const app = express();

// ─── Core Middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// ─── Security Headers ───────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// ─── Request Logger (dev only) ──────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.originalUrl} — ${new Date().toISOString()}`);
    next();
  });
}

// ─── Swagger Docs ───────────────────────────────────────────────────────────
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: 'Survey API Docs',
    customCss: '.swagger-ui .topbar { background-color: #1F3864; }',
  })
);

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/admin', adminRoutes);

// ─── API route index ────────────────────────────────────────────────────────
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Survey Records API v1.0',
    docs: '/api-docs',
    routes: {
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'Login and get JWT',
        'GET /api/auth/me': 'Get current user profile (protected)',
        'PATCH /api/auth/me': 'Update current user profile name (protected)',
      },
      surveys: {
        'GET /api/surveys': 'Get own survey records (user)',
        'POST /api/surveys': 'Create a survey record (user)',
        'POST /api/surveys/upload': 'Create survey with multipart file upload (user)',
        'GET /api/surveys/:id': 'Get own survey by ID (user)',
        'PUT /api/surveys/:id': 'Update own survey (user)',
        'DELETE /api/surveys/:id': 'Delete own survey (user)',
      },
      admin: {
        'GET /api/admin/stats': 'Dashboard statistics (admin)',
        'GET /api/admin/surveys': 'All surveys with filters (admin)',
        'GET /api/admin/surveys/:id': 'Any survey by ID (admin)',
        'PUT /api/admin/surveys/:id': 'Update any survey + status (admin)',
        'DELETE /api/admin/surveys/:id': 'Delete any survey (admin)',
        'GET /api/admin/export/csv': 'Export surveys as CSV (admin)',
        'GET /api/admin/export/excel': 'Export surveys as Excel (admin)',
      },
    },
  });
});

// ─── Error Handling ─────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`
🚀 Server running in ${process.env.NODE_ENV || 'development'} mode
📡 Port: ${PORT}
📖 API Docs: http://localhost:${PORT}/api-docs
🔗 API Base: http://localhost:${PORT}/api
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  process.exit(1);
});

module.exports = app;
