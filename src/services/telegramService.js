const logger = require('../utils/logger');

class TelegramService {
  constructor(ctx) {
    this.ctx = ctx;
  }

  async sendMessage(message, options = {}) {
    try {
      await this.ctx.reply(message, {
        parse_mode: 'HTML',
        ...options
      });
      logger.debug('Message sent via Telegram');
    } catch (error) {
      logger.error('Error sending Telegram message', { error: error.message });
      throw error;
    }
  }

  async sendFormattedReport(title, data) {
    try {
      const message = this.formatReport(title, data);
      await this.sendMessage(message);
    } catch (error) {
      logger.error('Error sending formatted report', { error: error.message });
      throw error;
    }
  }

  formatReport(title, data) {
    let message = `<b>${title}</b>\n\n`;

    if (typeof data === 'object') {
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'object') {
          message += `<b>${key}:</b>\n`;
          for (const [subKey, subValue] of Object.entries(value)) {
            message += `  ${subKey}: ${subValue}\n`;
          }
          message += '\n';
        } else {
          message += `<b>${key}:</b> ${value}\n`;
        }
      }
    } else {
      message += data;
    }

    return message;
  }

  formatCommandsList() {
    return `
<b>📋 Available Commands:</b>

<b>/start</b> - Welcome & command list

<b>📧 CAMPAIGN MANAGEMENT</b>
<code>/scrape &lt;type&gt; &lt;location&gt; [limit]</code>
  Example: /scrape restaurant "New York" 20

<code>/campaigns</code> - List all campaigns

<code>/campaign_stats &lt;campaign_id&gt;</code>
  Example: /campaign_stats 1

<b>📤 OUTREACH</b>
<code>/outreach_start &lt;campaign_id&gt; [product]</code>
  Example: /outreach_start 1 "AI Automation"

<code>/outreach_status</code> - Check outreach progress

<code>/outreach_pause</code> - Pause current outreach

<b>📊 ANALYTICS</b>
<code>/report &lt;campaign_id&gt;</code>
  Example: /report 1

<code>/replies &lt;campaign_id&gt; [intent]</code>
  Example: /replies 1 interested

<code>/system_report</code> - Full system overview

<b>🤖 AI TOOLS</b>
<code>/generate_email &lt;type&gt; &lt;location&gt;</code>
  Example: /generate_email restaurant "London"

<code>/ask &lt;question&gt;</code>
  Example: /ask "How to improve conversion rates?"

<code>/status</code> - System status

<b>Business Types:</b> restaurant, retail, saas, service, ecommerce, agency, manufacturing, healthcare, education, real_estate
    `;
  }
}

module.exports = TelegramService;