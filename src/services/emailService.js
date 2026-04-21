const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    this.rateLimitMap = new Map();
    this.maxEmails = parseInt(process.env.EMAIL_RATE_LIMIT) || 5;
    this.rateLimitInterval = parseInt(process.env.EMAIL_RATE_INTERVAL) || 60000;
  }

  isRateLimited() {
    const now = Date.now();
    const windowStart = now - this.rateLimitInterval;

    // Clean old entries
    for (const [timestamp] of this.rateLimitMap) {
      if (timestamp < windowStart) {
        this.rateLimitMap.delete(timestamp);
      }
    }

    if (this.rateLimitMap.size >= this.maxEmails) {
      return true;
    }

    return false;
  }

  recordEmailSent() {
    this.rateLimitMap.set(Date.now(), true);
  }

  async sendEmail(to, subject, html, from = process.env.EMAIL_FROM) {
    try {
      if (this.isRateLimited()) {
        throw new Error('Rate limit exceeded. Wait before sending more emails.');
      }

      const mailOptions = {
        from: from,
        to: to,
        subject: subject,
        html: html
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.recordEmailSent();

      logger.info('Email sent successfully', {
        to: to,
        messageId: info.messageId
      });

      return {
        success: true,
        messageId: info.messageId,
        to: to
      };
    } catch (error) {
      logger.error('Error sending email', {
        to: to,
        error: error.message
      });
      throw error;
    }
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      logger.info('Email service connected successfully');
      return true;
    } catch (error) {
      logger.error('Email service connection failed', { error: error.message });
      return false;
    }
  }

  getRateLimitStatus() {
    return {
      emailsSentInWindow: this.rateLimitMap.size,
      maxEmails: this.maxEmails,
      isLimited: this.isRateLimited(),
      windowMs: this.rateLimitInterval
    };
  }
}

module.exports = new EmailService();