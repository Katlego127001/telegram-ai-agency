const { Telegraf } = require('telegraf');
const logger = require('../utils/logger');
const { validateCommand, validateBusinessType, validateEmail } = require('../utils/validators');
const TelegramService = require('../services/telegramService');
const aiService = require('../services/aiService');
const emailService = require('../services/emailService');
const leadAgent = require('../agents/leadAgent');
const outreachAgent = require('../agents/outreachAgent');
const salesAgent = require('../agents/salesAgent');
const reportAgent = require('../agents/reportAgent');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class CommandHandler {
  constructor(bot) {
    this.bot = bot;
    this.registerCommands();
  }

  registerCommands() {
    // Start command
    this.bot.command('start', this.handleStart.bind(this));

    // Campaign management
    this.bot.command('scrape', this.handleScrape.bind(this));
    this.bot.command('campaigns', this.handleListCampaigns.bind(this));
    this.bot.command('campaign_stats', this.handleCampaignStats.bind(this));

    // Outreach
    this.bot.command('outreach_start', this.handleOutreachStart.bind(this));
    this.bot.command('outreach_status', this.handleOutreachStatus.bind(this));
    this.bot.command('outreach_pause', this.handleOutreachPause.bind(this));

    // Analytics
    this.bot.command('report', this.handleReport.bind(this));
    this.bot.command('replies', this.handleReplies.bind(this));
    this.bot.command('system_report', this.handleSystemReport.bind(this));

    // AI Tools
    this.bot.command('generate_email', this.handleGenerateEmail.bind(this));
    this.bot.command('ask', this.handleAsk.bind(this));
    this.bot.command('status', this.handleStatus.bind(this));

    // Fallback
    this.bot.on('text', this.handleUnknownCommand.bind(this));

    logger.info('Commands registered');
  }

  async handleStart(ctx) {
    try {
      const telegram = new TelegramService(ctx);
      const commandsList = telegram.formatCommandsList();
      await telegram.sendMessage(commandsList);
      logger.info('Start command executed');
    } catch (error) {
      logger.error('Error in start command', { error: error.message });
      await ctx.reply('❌ Error: ' + error.message);
    }
  }

  async handleScrape(ctx) {
    try {
      const args = ctx.message.text.split(/\s+/).slice(1);
      
      if (args.length < 2) {
        return ctx.reply(
          '❌ Usage: /scrape &lt;business_type&gt; &lt;location&gt; [limit]\n\n' +
          'Example: /scrape restaurant "New York" 20'
        );
      }

      const businessType = args[0];
      const location = args.slice(1, -1).join(' ') || args[1];
      const limit = parseInt(args[args.length - 1]) || 50;

      if (!validateBusinessType(businessType)) {
        return ctx.reply('❌ Invalid business type');
      }

      await ctx.reply('⏳ Scraping leads...');

      const result = await leadAgent.scrapAndStoreLeads(businessType, location, limit);

      const telegram = new TelegramService(ctx);
      await telegram.sendFormattedReport('✅ Leads Scraped', {
        'Campaign ID': result.campaign.id,
        'Campaign Name': result.campaign.name,
        'Leads Found': result.count,
        'Business Type': businessType,
        'Location': location
      });

      logger.info('Scrape command executed successfully', {
        campaignId: result.campaign.id,
        leadsCount: result.count
      });
    } catch (error) {
      logger.error('Error in scrape command', { error: error.message });
      await ctx.reply('❌ Error: ' + error.message);
    }
  }

  async handleListCampaigns(ctx) {
    try {
      const campaigns = await leadAgent.listCampaigns();

      if (campaigns.length === 0) {
        return ctx.reply('📭 No campaigns found');
      }

      let message = '<b>📋 Active Campaigns:</b>\n\n';
      campaigns.forEach(c => {
        message += `<b>ID:</b> ${c.id}\n`;
        message += `<b>Name:</b> ${c.name}\n`;
        message += `<b>Status:</b> ${c.status}\n`;
        message += `<b>Leads:</b> ${c._count.leads}\n`;
        message += `<b>Emails:</b> ${c._count.emailLogs}\n`;
        message += `<b>Replies:</b> ${c._count.replyLogs}\n`;
        message += `<b>Created:</b> ${new Date(c.createdAt).toLocaleString()}\n\n`;
      });

      await ctx.reply(message, { parse_mode: 'HTML' });
    } catch (error) {
      logger.error('Error in campaigns command', { error: error.message });
      await ctx.reply('❌ Error: ' + error.message);
    }
  }

  async handleCampaignStats(ctx) {
    try {
      const args = ctx.message.text.split(/\s+/).slice(1);
      
      if (args.length === 0) {
        return ctx.reply('❌ Usage: /campaign_stats &lt;campaign_id&gt;');
      }

      const campaignId = parseInt(args[0]);

      const stats = await leadAgent.getCampaignStats(campaignId);

      const telegram = new TelegramService(ctx);
      await telegram.sendFormattedReport('📊 Campaign Statistics', stats);
    } catch (error) {
      logger.error('Error in campaign_stats command', { error: error.message });
      await ctx.reply('❌ Error: ' + error.message);
    }
  }

  async handleOutreachStart(ctx) {
    try {
      const args = ctx.message.text.split(/\s+/).slice(1);
      
      if (args.length === 0) {
        return ctx.reply('❌ Usage: /outreach_start &lt;campaign_id&gt; [product_service]');
      }

      const campaignId = parseInt(args[0]);
      const productService = args.slice(1).join(' ') || 'AI Automation';

      await ctx.reply('🚀 Starting outreach campaign...');

      const result = await outreachAgent.startCampaign(campaignId, productService);

      const telegram = new TelegramService(ctx);
      await telegram.sendFormattedReport('✅ Outreach Complete', {
        'Campaign ID': result.campaignId,
        'Total Leads': result.totalLeads,
        'Emails Sent': result.sentCount,
        'Failed': result.failedCount
      });

      logger.info('Outreach command executed', result);
    } catch (error) {
      logger.error('Error in outreach_start command', { error: error.message });
      await ctx.reply('❌ Error: ' + error.message);
    }
  }

  async handleOutreachStatus(ctx) {
    try {
      const status = outreachAgent.getStatus();

      let message = '<b>📊 Outreach Status</b>\n\n';
      if (status.isRunning) {
        message += `🔄 Status: <b>RUNNING</b>\n`;
        message += `📌 Campaign ID: ${status.currentCampaignId}`;
      } else {
        message += `⏸️ Status: <b>IDLE</b>`;
      }

      await ctx.reply(message, { parse_mode: 'HTML' });
    } catch (error) {
      logger.error('Error in outreach_status command', { error: error.message });
      await ctx.reply('❌ Error: ' + error.message);
    }
  }

  async handleOutreachPause(ctx) {
    try {
      const paused = outreachAgent.pauseCampaign();

      if (paused) {
        await ctx.reply('⏸️ Campaign paused');
      } else {
        await ctx.reply('ℹ️ No campaign is currently running');
      }
    } catch (error) {
      logger.error('Error in outreach_pause command', { error: error.message });
      await ctx.reply('❌ Error: ' + error.message);
    }
  }

  async handleReport(ctx) {
    try {
      const args = ctx.message.text.split(/\s+/).slice(1);
      
      if (args.length === 0) {
        return ctx.reply('❌ Usage: /report &lt;campaign_id&gt;');
      }

      const campaignId = parseInt(args[0]);

      const report = await reportAgent.generateCampaignReport(campaignId);

      const telegram = new TelegramService(ctx);
      await telegram.sendFormattedReport('📈 Campaign Report', report);
    } catch (error) {
      logger.error('Error in report command', { error: error.message });
      await ctx.reply('❌ Error: ' + error.message);
    }
  }

  async handleReplies(ctx) {
    try {
      const args = ctx.message.text.split(/\s+/).slice(1);
      
      if (args.length === 0) {
        return ctx.reply('❌ Usage: /replies &lt;campaign_id&gt; [intent]');
      }

      const campaignId = parseInt(args[0]);
      const intent = args[1] || null;

      const replies = await salesAgent.getReplies(campaignId, intent);

      if (replies.length === 0) {
        return ctx.reply('📭 No replies found');
      }

      let message = `<b>💬 Replies (${replies.length})</b>\n\n`;
      replies.slice(0, 10).forEach((reply, idx) => {
        message += `<b>${idx + 1}.</b> ${reply.senderEmail}\n`;
        message += `   Intent: <b>${reply.intent || 'N/A'}</b> (${(reply.confidence || 0).toFixed(2)})\n`;
        message += `   Subject: ${reply.subject}\n\n`;
      });

      if (replies.length > 10) {
        message += `... and ${replies.length - 10} more`;
      }

      await ctx.reply(message, { parse_mode: 'HTML' });
    } catch (error) {
      logger.error('Error in replies command', { error: error.message });
      await ctx.reply('❌ Error: ' + error.message);
    }
  }

  async handleSystemReport(ctx) {
    try {
      await ctx.reply('⏳ Generating system report...');

      const report = await reportAgent.generateSystemReport();

      const telegram = new TelegramService(ctx);
      await telegram.sendFormattedReport('🖥️ System Report', report.totals);

      let campaignMessage = '<b>📊 Campaign Breakdown:</b>\n\n';
      report.campaigns.forEach(c => {
        campaignMessage += `<b>${c.name}</b> (ID: ${c.id})\n`;
        campaignMessage += `  Status: ${c.status}\n`;
        campaignMessage += `  Leads: ${c.leads}\n`;
        campaignMessage += `  Emails: ${c.emailsSent}\n`;
        campaignMessage += `  Replies: ${c.replies}\n\n`;
      });

      await ctx.reply(campaignMessage, { parse_mode: 'HTML' });
    } catch (error) {
      logger.error('Error in system_report command', { error: error.message });
      await ctx.reply('❌ Error: ' + error.message);
    }
  }

  async handleGenerateEmail(ctx) {
    try {
      const args = ctx.message.text.split(/\s+/).slice(1);
      
      if (args.length < 2) {
        return ctx.reply(
          '❌ Usage: /generate_email &lt;business_type&gt; &lt;location&gt;\n\n' +
          'Example: /generate_email restaurant "New York"'
        );
      }

      const businessType = args[0];
      const location = args.slice(1).join(' ');

      if (!validateBusinessType(businessType)) {
        return ctx.reply('❌ Invalid business type');
      }

      await ctx.reply('✍️ Generating email...');

      const email = await aiService.generateOutreachEmail(businessType, location);

      let message = '<b>📧 Generated Email:</b>\n\n';
      message += `<b>Subject:</b> ${email.subject}\n\n`;
      message += `<b>Body:</b>\n${email.body}`;

      await ctx.reply(message, { parse_mode: 'HTML' });
    } catch (error) {
      logger.error('Error in generate_email command', { error: error.message });
      await ctx.reply('❌ Error: ' + error.message);
    }
  }

  async handleAsk(ctx) {
    try {
      const question = ctx.message.text.replace('/ask', '').trim();

      if (!question) {
        return ctx.reply('❌ Usage: /ask &lt;question&gt;');
      }

      await ctx.reply('🤔 Thinking...');

      // Get some context
      const systemReport = await reportAgent.generateSystemReport();
      const context = {
        totalLeads: systemReport.totals.totalLeads,
        emailsSent: systemReport.totals.totalEmailsSent,
        replies: systemReport.totals.totalReplies,
        conversionRate: systemReport.totals.totalEmailsSent > 0
          ? ((systemReport.totals.totalReplies / systemReport.totals.totalEmailsSent) * 100).toFixed(2) + '%'
          : '0%'
      };

      const answer = await aiService.getInsights(question, context);

      let message = `<b>💡 AI Insights:</b>\n\n${answer}`;

      await ctx.reply(message, { parse_mode: 'HTML' });
    } catch (error) {
      logger.error('Error in ask command', { error: error.message });
      await ctx.reply('❌ Error: ' + error.message);
    }
  }

  async handleStatus(ctx) {
    try {
      const emailStatus = emailService.getRateLimitStatus();
      const outreachStatus = outreachAgent.getStatus();

      let message = '<b>🖥️ System Status</b>\n\n';

      // Email status
      message += `<b>📧 Email Service:</b>\n`;
      message += `  Sent in window: ${emailStatus.emailsSentInWindow}/${emailStatus.maxEmails}\n`;
      message += `  Rate limited: ${emailStatus.isLimited ? '⚠️ YES' : '✅ NO'}\n\n`;

      // Outreach status
      message += `<b>📤 Outreach:</b>\n`;
      message += `  Running: ${outreachStatus.isRunning ? '🔄 YES' : '⏸️ NO'}\n`;
      if (outreachStatus.isRunning) {
        message += `  Campaign ID: ${outreachStatus.currentCampaignId}\n`;
      }
      message += '\n';

      // Database status
      const systemReport = await reportAgent.generateSystemReport();
      message += `<b>📊 Database:</b>\n`;
      message += `  Campaigns: ${systemReport.totals.totalCampaigns}\n`;
      message += `  Total Leads: ${systemReport.totals.totalLeads}\n`;
      message += `  Emails Sent: ${systemReport.totals.totalEmailsSent}\n`;
      message += `  Replies: ${systemReport.totals.totalReplies}`;

      await ctx.reply(message, { parse_mode: 'HTML' });
    } catch (error) {
      logger.error('Error in status command', { error: error.message });
      await ctx.reply('❌ Error: ' + error.message);
    }
  }

  async handleUnknownCommand(ctx) {
    const text = ctx.message.text.toLowerCase();
    
    // Only respond if it looks like someone is trying to run a command
    if (text.startsWith('/')) {
      await ctx.reply('❓ Unknown command. Type /start for help.');
    }
  }
}

module.exports = CommandHandler;