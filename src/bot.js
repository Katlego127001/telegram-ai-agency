const { Telegraf } = require('telegraf');
const logger = require('./utils/logger');
const CommandHandler = require('./handlers/commandHandler');

class TelegramBot {
  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN is not set');
    }

    this.bot = new Telegraf(token);
    this.initializeMiddleware();
    this.initializeHandlers();
  }

  initializeMiddleware() {
    // Request logging middleware
    this.bot.use((ctx, next) => {
      logger.debug('Telegram request', {
        userId: ctx.from.id,
        username: ctx.from.username,
        text: ctx.message?.text || 'no text'
      });
      return next();
    });

    // Error handler
    this.bot.catch((err, ctx) => {
      logger.error('Telegram bot error', {
        error: err.message,
        userId: ctx.from?.id,
        stack: err.stack
      });
      ctx.reply('❌ An error occurred: ' + err.message).catch(e => {
        logger.error('Error sending error message', { error: e.message });
      });
    });
  }

  initializeHandlers() {
    new CommandHandler(this.bot);
  }

  async launch() {
    try {
      logger.info('Launching Telegram bot...');
      await this.bot.launch();
      logger.info('Telegram bot launched successfully');

      // Enable graceful stop
      process.once('SIGINT', () => this.bot.stop('SIGINT'));
      process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    } catch (error) {
      logger.error('Error launching Telegram bot', { error: error.message });
      throw error;
    }
  }

  async stop() {
    try {
      logger.info('Stopping Telegram bot...');
      await this.bot.stop();
      logger.info('Telegram bot stopped');
    } catch (error) {
      logger.error('Error stopping Telegram bot', { error: error.message });
    }
  }
}

module.exports = TelegramBot;