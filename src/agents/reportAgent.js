const logger = require('../utils/logger');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class ReportAgent {
  async generateCampaignReport(campaignId) {
    try {
      logger.info('Report Agent: Generating campaign report', { campaignId });

      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: {
          leads: {
            include: {
              emailLogs: true,
              replyLogs: true
            }
          },
          emailLogs: true,
          replyLogs: true
        }
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const emailStats = {
        total: campaign.emailLogs.length,
        sent: campaign.emailLogs.filter(e => e.status === 'sent').length,
        failed: campaign.emailLogs.filter(e => e.status === 'failed').length,
        bounced: campaign.emailLogs.filter(e => e.status === 'bounced').length
      };

      const replyStats = {
        total: campaign.replyLogs.length,
        interested: campaign.replyLogs.filter(r => r.intent === 'interested').length,
        notInterested: campaign.replyLogs.filter(r => r.intent === 'not_interested').length,
        followUp: campaign.replyLogs.filter(r => r.intent === 'follow_up').length
      };

      const conversionRate = emailStats.sent > 0
        ? ((replyStats.total / emailStats.sent) * 100).toFixed(2)
        : 0;

      const interestRate = replyStats.total > 0
        ? ((replyStats.interested / replyStats.total) * 100).toFixed(2)
        : 0;

      const report = {
        campaignId,
        campaignName: campaign.name,
        status: campaign.status,
        businessType: campaign.businessType,
        location: campaign.location,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
        leads: {
          total: campaign.leads.length
        },
        emails: emailStats,
        replies: replyStats,
        metrics: {
          conversionRate: conversionRate + '%',
          interestRate: interestRate + '%',
          responseRate: replyStats.total > 0 ? replyStats.total : 0
        }
      };

      logger.info('Report Agent: Report generated', { campaignId });
      return report;
    } catch (error) {
      logger.error('Report Agent: Error generating report', {
        campaignId,
        error: error.message
      });
      throw error;
    }
  }

  async generateSystemReport() {
    try {
      logger.info('Report Agent: Generating system report');

      const campaigns = await prisma.campaign.findMany({
        include: {
          _count: {
            select: {
              leads: true,
              emailLogs: true,
              replyLogs: true
            }
          }
        }
      });

      const totalStats = {
        totalCampaigns: campaigns.length,
        totalLeads: campaigns.reduce((sum, c) => sum + c._count.leads, 0),
        totalEmailsSent: campaigns.reduce((sum, c) => sum + c._count.emailLogs, 0),
        totalReplies: campaigns.reduce((sum, c) => sum + c._count.replyLogs, 0)
      };

      const campaignBreakdown = campaigns.map(c => ({
        id: c.id,
        name: c.name,
        status: c.status,
        leads: c._count.leads,
        emailsSent: c._count.emailLogs,
        replies: c._count.replyLogs
      }));

      const report = {
        timestamp: new Date(),
        totals: totalStats,
        campaigns: campaignBreakdown
      };

      logger.info('Report Agent: System report generated');
      return report;
    } catch (error) {
      logger.error('Report Agent: Error generating system report', {
        error: error.message
      });
      throw error;
    }
  }

  async exportReportAsText(campaignId) {
    try {
      const report = await this.generateCampaignReport(campaignId);

      let text = `
========================================
CAMPAIGN REPORT
========================================

Campaign: ${report.campaignName}
ID: ${report.campaignId}
Status: ${report.status}
Business Type: ${report.businessType}
Location: ${report.location}

Created: ${report.createdAt}
Updated: ${report.updatedAt}

========================================
STATISTICS
========================================

Total Leads: ${report.leads.total}

EMAILS:
  - Total: ${report.emails.total}
  - Sent: ${report.emails.sent}
  - Failed: ${report.emails.failed}
  - Bounced: ${report.emails.bounced}

REPLIES:
  - Total: ${report.replies.total}
  - Interested: ${report.replies.interested}
  - Not Interested: ${report.replies.notInterested}
  - Follow-up: ${report.replies.followUp}

METRICS:
  - Conversion Rate: ${report.metrics.conversionRate}
  - Interest Rate: ${report.metrics.interestRate}
  - Response Count: ${report.metrics.responseRate}

========================================
      `;

      return text;
    } catch (error) {
      logger.error('Report Agent: Error exporting report', {
        campaignId,
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = new ReportAgent();