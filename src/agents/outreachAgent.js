const emailService = require('../services/emailService');
const aiService = require('../services/aiService');
const scraperService = require('../services/scraperService');
const logger = require('../utils/logger');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class OutreachAgent {
  constructor() {
    this.isRunning = false;
    this.currentCampaignId = null;
  }

  async startCampaign(campaignId, productService = 'AI Automation') {
    try {
      if (this.isRunning) {
        throw new Error('A campaign is already running');
      }

      this.isRunning = true;
      this.currentCampaignId = campaignId;

      logger.info('Outreach Agent: Starting campaign', { campaignId });

      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: { leads: true }
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Update campaign status
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: 'active' }
      });

      let sentCount = 0;
      let failedCount = 0;
      const results = [];

      for (const lead of campaign.leads) {
        if (!this.isRunning) {
          logger.warn('Outreach Agent: Campaign stopped by user');
          break;
        }

        try {
          // Generate email
          const emailContent = await aiService.generateOutreachEmail(
            campaign.businessType,
            campaign.location,
            productService
          );

          // Send email
          const emailResult = await emailService.sendEmail(
            lead.email,
            emailContent.subject,
            this.formatEmailBody(emailContent.body),
            process.env.EMAIL_FROM
          );

          // Log email
          await prisma.emailLog.create({
            data: {
              campaignId,
              leadId: lead.id,
              recipientEmail: lead.email,
              subject: emailContent.subject,
              body: emailContent.body,
              status: 'sent',
              sentAt: new Date()
            }
          });

          sentCount++;
          results.push({
            lead: lead.email,
            status: 'sent',
            messageId: emailResult.messageId
          });

          logger.info('Outreach Agent: Email sent', {
            lead: lead.email,
            campaignId
          });

          // Rate limiting - wait 5 seconds between emails
          await new Promise(resolve => setTimeout(resolve, 5000));
        } catch (error) {
          failedCount++;
          logger.error('Outreach Agent: Failed to send email', {
            lead: lead.email,
            error: error.message
          });

          // Log failed email
          await prisma.emailLog.create({
            data: {
              campaignId,
              leadId: lead.id,
              recipientEmail: lead.email,
              subject: 'Failed',
              body: 'Failed to send',
              status: 'failed',
              error: error.message
            }
          });

          results.push({
            lead: lead.email,
            status: 'failed',
            error: error.message
          });
        }
      }

      // Update campaign status
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: 'completed' }
      });

      this.isRunning = false;
      this.currentCampaignId = null;

      const summary = {
        campaignId,
        totalLeads: campaign.leads.length,
        sentCount,
        failedCount,
        results
      };

      logger.info('Outreach Agent: Campaign completed', summary);
      return summary;
    } catch (error) {
      this.isRunning = false;
      this.currentCampaignId = null;

      logger.error('Outreach Agent: Error in campaign', {
        campaignId,
        error: error.message
      });
      throw error;
    }
  }

  formatEmailBody(body) {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto;">
            ${body.split('\n').map(line => `<p>${line}</p>`).join('')}
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">
              This is an automated outreach message. 
              <a href="https://yourdomain.com/unsubscribe" style="color: #0066cc;">Unsubscribe</a>
            </p>
          </div>
        </body>
      </html>
    `;
  }

  pauseCampaign() {
    if (this.isRunning) {
      this.isRunning = false;
      logger.info('Outreach Agent: Campaign paused');
      return true;
    }
    return false;
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      currentCampaignId: this.currentCampaignId
    };
  }
}

module.exports = new OutreachAgent();