require('dotenv').config();
const express = require('express');
const TelegramBot = require('./bot');
const emailService = require('./services/emailService');
const logger = require('./utils/logger');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Database health check
app.get('/health/db', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// Email service status
app.get('/health/email', async (req, res) => {
  try {
    const verified = await emailService.verifyConnection();
    res.json({
      status: verified ? 'ok' : 'error',
      email: verified ? 'connected' : 'disconnected'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Initialize and start
async function main() {
  try {
    logger.info('='.repeat(50));
    logger.info('🚀 TELEGRAM AI AGENCY SYSTEM STARTING');
    logger.info('='.repeat(50));

    // Verify database connection
    logger.info('Verifying database connection...');
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✅ Database connected');

    // Verify email service
    logger.info('Verifying email service...');
    const emailVerified = await emailService.verifyConnection();
    if (emailVerified) {
      logger.info('✅ Email service ready');
    } else {
      logger.warn('⚠️ Email service verification failed');
    }

    // Start Express server
    const httpServer = app.listen(PORT, () => {
      logger.info(`✅ HTTP Server listening on port ${PORT}`);
    });

    // Start Telegram bot
    const bot = new TelegramBot();
    await bot.launch();

    logger.info('='.repeat(50));
    logger.info('✅ SYSTEM READY');
    logger.info('='.repeat(50));
    logger.info(`Send /start to your Telegram bot to get started`);
    logger.info('='.repeat(50));

    // Graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Shutting down gracefully...');
      await bot.stop();
      await prisma.$disconnect();
      httpServer.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Fatal error', { error: error.message });
    process.exit(1);
  }
}

main();

module.exports = app;