const scraperService = require('../services/scraperService');
const logger = require('../utils/logger');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class LeadAgent {
  async scrapAndStoreLeads(businessType, location, limit) {
    try {
      logger.info('Lead Agent: Starting scrape operation', {
        businessType,
        location,
        limit
      });

      // Scrape leads
      const scrapedLeads = await scraperService.scrapeLeads(
        businessType,
        location,
        limit
      );

      // Create campaign
      const campaign = await prisma.campaign.create({
        data: {
          name: `${businessType}_${location}_${Date.now()}`,
          businessType,
          location,
          limit: scrapedLeads.length
        }
      });

      // Save to database
      const savedLeads = await scraperService.saveLeadsToDatabase(
        scrapedLeads,
        campaign.id
      );

      logger.info('Lead Agent: Scrape operation completed', {
        campaignId: campaign.id,
        leadsCount: savedLeads.length
      });

      return {
        campaign,
        leads: savedLeads,
        count: savedLeads.length
      };
    } catch (error) {
      logger.error('Lead Agent: Error in scrap operation', {
        error: error.message
      });
      throw error;
    }
  }

  async getCampaignStats(campaignId) {
    try {
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: {
          leads: {
            include: {
              emailLogs: true,
              replyLogs: true
            }
          }
        }
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const stats = {
        campaignId,
        campaignName: campaign.name,
        status: campaign.status,
        totalLeads: campaign.leads.length,
        emailsSent: campaign.leads.reduce((sum, lead) => sum + lead.emailLogs.length, 0),
        replies: campaign.leads.reduce((sum, lead) => sum + lead.replyLogs.length, 0),
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt
      };

      return stats;
    } catch (error) {
      logger.error('Lead Agent: Error getting campaign stats', {
        campaignId,
        error: error.message
      });
      throw error;
    }
  }

  async listCampaigns() {
    try {
      const campaigns = await prisma.campaign.findMany({
        include: {
          _count: {
            select: {
              leads: true,
              emailLogs: true,
              replyLogs: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return campaigns;
    } catch (error) {
      logger.error('Lead Agent: Error listing campaigns', {
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = new LeadAgent();