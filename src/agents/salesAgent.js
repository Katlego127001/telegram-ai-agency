const aiService = require('../services/aiService');
const logger = require('../utils/logger');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class SalesAgent {
  async processReply(campaignId, leadId, senderEmail, subject, body) {
    try {
      logger.info('Sales Agent: Processing reply', {
        campaignId,
        leadId,
        senderEmail
      });

      // Classify the reply
      const classification = await aiService.classifyText(body, 'intent');

      // Store reply
      const replyLog = await prisma.replyLog.create({
        data: {
          campaignId,
          leadId,
          senderEmail,
          subject,
          body,
          intent: classification.intent || null,
          confidence: classification.confidence || 0,
          raw: JSON.stringify(classification)
        }
      });

      logger.info('Sales Agent: Reply processed', {
        replyId: replyLog.id,
        intent: classification.intent
      });

      return replyLog;
    } catch (error) {
      logger.error('Sales Agent: Error processing reply', {
        campaignId,
        leadId,
        error: error.message
      });
      throw error;
    }
  }

  async getReplies(campaignId, intent = null) {
    try {
      const query = { campaignId };
      if (intent) {
        query.intent = intent;
      }

      const replies = await prisma.replyLog.findMany({
        where: query,
        include: {
          lead: true,
          campaign: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return replies;
    } catch (error) {
      logger.error('Sales Agent: Error getting replies', {
        campaignId,
        error: error.message
      });
      throw error;
    }
  }

  async getReplyStats(campaignId) {
    try {
      const replies = await prisma.replyLog.findMany({
        where: { campaignId }
      });

      const stats = {
        total: replies.length,
        interested: replies.filter(r => r.intent === 'interested').length,
        notInterested: replies.filter(r => r.intent === 'not_interested').length,
        followUp: replies.filter(r => r.intent === 'follow_up').length,
        unclassified: replies.filter(r => !r.intent).length
      };

      stats.conversionRate = stats.total > 0 
        ? ((stats.interested / stats.total) * 100).toFixed(2) + '%'
        : '0%';

      return stats;
    } catch (error) {
      logger.error('Sales Agent: Error getting reply stats', {
        campaignId,
        error: error.message
      });
      throw error;
    }
  }

  async getTopProspects(campaignId, limit = 10) {
    try {
      const prospects = await prisma.replyLog.findMany({
        where: {
          campaignId,
          intent: 'interested'
        },
        include: {
          lead: true
        },
        orderBy: {
          confidence: 'desc'
        },
        take: limit
      });

      return prospects;
    } catch (error) {
      logger.error('Sales Agent: Error getting top prospects', {
        campaignId,
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = new SalesAgent();