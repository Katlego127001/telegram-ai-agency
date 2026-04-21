# 🚀 TELEGRAM-FIRST AI AGENCY SYSTEM

A **complete, production-ready AI agency system** controlled entirely via Telegram. Generate leads, send AI-powered emails, classify replies, and get intelligent insights—all from your Telegram chat.

**No frontend, no dashboard. Everything works via Telegram commands.**

---

## ✨ KEY FEATURES

- 📧 **AI-Powered Email Generation** - Uses Ollama (phi model) for instant cold emails
- 💼 **Lead Management** - Scrape, store, and organize leads by campaign
- 📤 **Bulk Outreach** - Send personalized emails to all leads with rate limiting
- 📊 **Sales Analytics** - Track emails sent, replies received, and conversion rates
- 🧠 **AI Insights** - Ask questions about your campaigns and get recommendations
- 💬 **Telegram Bot** - Complete control via simple chat commands
- 🗄️ **Persistent Database** - PostgreSQL with Prisma ORM
- ⚡ **Ultra-Fast** - Phi model generates emails in ~20 seconds
- 🔄 **Rate Limiting** - Built-in email throttling (5 emails per 60 seconds)
- 📈 **Real-time Reports** - Campaign stats and system overview on demand

---

## 🛠️ TECH STACK

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Runtime** | Node.js v18+ | Application runtime |
| **Framework** | Express.js | HTTP server |
| **Database** | PostgreSQL 12+ | Data persistence |
| **ORM** | Prisma 5.7.1 | Database management |
| **Bot** | Telegraf 4.14.0 | Telegram integration |
| **AI/LLM** | Ollama + phi | Local AI model |
| **Email** | Nodemailer | SMTP integration |
| **HTTP Client** | Axios | API requests |

---

## 📋 PREREQUISITES

Before you start, ensure you have:

- ✅ **Node.js** v18 or higher
- ✅ **npm** v8 or higher
- ✅ **PostgreSQL** v12 or higher
- ✅ **Ollama** installed (with phi model)
- ✅ **Telegram Bot Token** (from @BotFather)
- ✅ **Gmail App Password** (from account.google.com/apppasswords)

### Quick Checks

```bash
# Check Node.js
node --version  # Should be v18+

# Check npm
npm --version   # Should be v8+

# Check PostgreSQL
psql --version  # Should be 12+

# Check Ollama
ollama list     # Should show phi model

🚀 INSTALLATION GUIDE
STEP 1: Clone Repository
Bash

git clone <your-repository-url>
cd telegram-ai-agency
STEP 2: Install Dependencies
Bash

npm install
Expected output:

text

added XX packages in Xs
STEP 3: Set Up PostgreSQL Database
Create database and user:

Bash

psql -U postgres

# In psql prompt:
CREATE DATABASE telegram_ai_agency;
CREATE USER teleai WITH PASSWORD 'your_secure_password_123';
ALTER ROLE teleai CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE telegram_ai_agency TO teleai;
\connect telegram_ai_agency
GRANT ALL ON SCHEMA public TO teleai;
\q
Verify connection:

Bash

psql postgresql://teleai:your_secure_password_123@localhost:5432/telegram_ai_agency
\q
STEP 4: Configure Environment Variables
Create .env file:

Bash

cp .env.example .env
Edit .env with your credentials:

env

# ==================== DATABASE ====================
DATABASE_URL="postgresql://teleai:your_secure_password_123@localhost:5432/telegram_ai_agency"

# ==================== TELEGRAM ====================
TELEGRAM_BOT_TOKEN="your_bot_token_from_botfather"
TELEGRAM_ADMIN_ID="your_telegram_user_id"

# ==================== EMAIL ====================
# Generate App Password: https://myaccount.google.com/apppasswords
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_app_password_16_chars"
EMAIL_FROM="noreply@yourdomain.com"

# ==================== OLLAMA ====================
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="phi"

# ==================== SERVER ====================
PORT=3000
NODE_ENV="development"

# ==================== RATE LIMITING ====================
EMAIL_RATE_LIMIT=5
EMAIL_RATE_INTERVAL=60000

# ==================== FEATURES ====================
USE_TEMPLATES="false"
Get your Telegram User ID:

Message @userinfobot on Telegram
It will reply with your user ID
Add to .env as TELEGRAM_ADMIN_ID
STEP 5: Initialize Database Schema
Bash

npx prisma db push
Expected:

text

✔ Your database is now in sync with your schema. Done in XXms
STEP 6: Generate Prisma Client
Bash

npx prisma generate
STEP 7: Install Ollama (If Not Already Done)
Bash

# Download from https://ollama.ai

# Then pull phi model (if not already installed)
ollama pull phi

# Verify
ollama list
# Should show: phi:latest   2.7 GB
🎯 QUICK START (3 TERMINALS)
Terminal 1: Start Ollama
Bash

ollama serve
Expected output:

text

time=2026-04-15T21:00:00.000Z level=INFO msg="Listening on 127.0.0.1:11434"
Terminal 2: Start Application
Bash

npm start
Expected output:

text

==================================================
🚀 TELEGRAM AI AGENCY SYSTEM STARTING
==================================================
✅ Database connected
✅ Email service ready
✅ HTTP Server listening on port 3000
✅ Telegram bot launched successfully
==================================================
✅ SYSTEM READY
==================================================
Terminal 3: Open Telegram
Send /start to your bot and see the command list!

📲 TELEGRAM COMMANDS REFERENCE
System Commands
Command	Purpose	Example
/start	Show welcome message & all commands	/start
/status	Check system health (DB, email, outreach)	/status
Campaign Management
Command	Purpose	Example
/scrape <type> <location> [limit]	Create campaign and scrape leads	/scrape restaurant "Johannesburg" 10
/campaigns	List all campaigns	/campaigns
/campaign_stats <id>	Get campaign statistics	/campaign_stats 1
Email Outreach
Command	Purpose	Example
/generate_email <type> <location>	Generate sample email preview	/generate_email restaurant "Cape Town"
/outreach_start <id> [product]	Send emails to all leads in campaign	/outreach_start 1 "AI Automation"
/outreach_status	Check if outreach is running	/outreach_status
/outreach_pause	Stop current outreach campaign	/outreach_pause
Analytics & Reporting
Command	Purpose	Example
/report <id>	Get full campaign report	/report 1
/replies <id> [intent]	View email replies with classification	/replies 1 interested
/system_report	Get system-wide statistics	/system_report
AI Tools
Command	Purpose	Example
/ask <question>	Ask AI about campaigns and sales	/ask "How to improve conversion rates?"
Business Types (For Scraping)
text

restaurant, retail, saas, service, ecommerce, 
agency, manufacturing, healthcare, education, real_estate
Example:

text

/scrape saas "San Francisco" 15
/scrape retail "Los Angeles" 20
/scrape service "New York" 10
🧪 TESTING & VALIDATION
Test 1: System Health Check
Bash

# Terminal 1: Ollama running
ollama serve

# Terminal 2: App running
npm start

# Terminal 3: Check endpoints
curl http://localhost:3000/health
curl http://localhost:3000/health/db
curl http://localhost:3000/health/email
Expected responses:

JSON

{
  "status": "ok",
  "timestamp": "2026-04-15T21:00:00.000Z"
}
Test 2: Telegram Bot Commands
Send these commands in order to your Telegram bot:

text

1. /start
   ✅ Expect: Command list

2. /status
   ✅ Expect: All services green

3. /scrape restaurant "Johannesburg" 10
   ✅ Expect: Campaign created with 10 leads

4. /campaign_stats 1
   ✅ Expect: Shows 10 leads, 0 emails

5. /generate_email restaurant "Johannesburg"
   ✅ Expect: Email preview in ~20 seconds

6. /outreach_start 1 "AI Automation"
   ✅ Expect: Sends 10 emails (1-2 min total)

7. /outreach_status
   ✅ Expect: Shows IDLE (completed)

8. /report 1
   ✅ Expect: Full campaign analytics

9. /system_report
   ✅ Expect: System-wide stats

10. /ask "How many emails did I send?"
    ✅ Expect: AI provides insights
Test 3: Database Inspection
Bash

# Open Prisma Studio
npx prisma studio

# Opens http://localhost:5555
# Verify:
# ✅ Campaign created
# ✅ 10 leads stored
# ✅ 10 email logs with status="sent"
Test 4: Log Verification
Bash

# Check application logs
tail -f logs/app.log

# Check error logs
tail -f logs/error.log

# Expected in logs:
# [INFO] Lead Agent: Scrape operation completed
# [INFO] Outreach Agent: Campaign completed
# [INFO] Email sent successfully
Test 5: Email Verification
Check your email inbox or spam folder for emails sent from the campaign. They should be from EMAIL_FROM address configured in .env.

📊 COMPLETE E2E WORKFLOW EXAMPLE
This script runs a complete end-to-end test:

Step-by-Step Guide
Step 1: Create Campaign

text

/scrape saas "Cape Town" 8
Response includes Campaign ID (note it, e.g., 2)

Step 2: Verify Campaign

text

/campaign_stats 2
Should show: 8 leads, 0 emails

Step 3: Preview Email

text

/generate_email saas "Cape Town"
Should return generated email in ~20 seconds

Step 4: Send Outreach

text

/outreach_start 2 "AI Automation Platform"
Should show: Sending to 8 leads... then complete with 8 sent, 0 failed

Step 5: Get Report

text

/report 2
Should show: 8 emails sent, 0 failures

Step 6: Multi-Campaign Test

text

/scrape retail "Durban" 5
/outreach_start 3 "Retail AI"
/scrape service "Pretoria" 6
/campaigns
Step 7: Final Report

text

/system_report
Should show all campaigns and totals

Step 8: Visual Inspection

Bash

npx prisma studio
Verify all campaigns, leads, and email logs in database

🗄️ DATABASE SCHEMA
Lead Table
SQL

- id (Primary Key)
- name (String)
- email (Unique, String)
- phone (String, Optional)
- businessType (String)
- location (String)
- website (String, Optional)
- campaignId (Foreign Key)
- createdAt (DateTime)
- updatedAt (DateTime)
Campaign Table
SQL

- id (Primary Key)
- name (Unique, String)
- businessType (String)
- location (String)
- limit (Integer)
- status (String: draft, active, paused, completed)
- createdAt (DateTime)
- updatedAt (DateTime)
EmailLog Table
SQL

- id (Primary Key)
- campaignId (Foreign Key)
- leadId (Foreign Key)
- recipientEmail (String)
- subject (String)
- body (Text)
- status (String: pending, sent, failed, bounced)
- error (String, Optional)
- sentAt (DateTime, Optional)
- createdAt (DateTime)
ReplyLog Table
SQL

- id (Primary Key)
- campaignId (Foreign Key)
- leadId (Foreign Key)
- senderEmail (String)
- subject (String)
- body (Text)
- intent (String: interested, not_interested, follow_up)
- confidence (Float: 0-1)
- raw (JSON)
- createdAt (DateTime)
📁 PROJECT STRUCTURE
text

telegram-ai-agency/
├── prisma/
│   └── schema.prisma              # Database schema
├── src/
│   ├── agents/
│   │   ├── leadAgent.js           # Lead scraping & management
│   │   ├── outreachAgent.js       # Email sending logic
│   │   ├── salesAgent.js          # Reply classification
│   │   └── reportAgent.js         # Analytics & reporting
│   ├── handlers/
│   │   └── commandHandler.js      # Telegram command routing
│   ├── services/
│   │   ├── aiService.js           # AI/Ollama integration
│   │   ├── emailService.js        # Email sending (SMTP)
│   │   ├── scraperService.js      # Lead scraping
│   │   └── telegramService.js     # Telegram utilities
│   ├── utils/
│   │   ├── logger.js              # Logging utility
│   │   └── validators.js          # Input validation
│   ├── bot.js                     # Telegram bot setup
│   └── server.js                  # Express server & startup
├── logs/                          # Auto-created log files
│   ├── app.log                    # Application logs
│   └── error.log                  # Error logs
├── .env                           # Environment variables (NOT in git)
├── .env.example                   # Example env template
├── .gitignore                     # Git ignore rules
├── package.json                   # Dependencies
├── package-lock.json              # Dependency lock
└── README.md                      # This file
🔐 SECURITY BEST PRACTICES
Secrets Management
env

❌ DON'T:
- Commit .env to git
- Use main Google password
- Share bot token publicly
- Store credentials in code

✅ DO:
- Use .env.example template
- Generate Gmail App Password
- Keep .env in .gitignore
- Use environment variables
- Rotate credentials regularly
Database Security
SQL

-- Use strong passwords
CREATE USER teleai WITH PASSWORD 'strong_random_password_123!@#';

-- Limit permissions
GRANT CONNECT ON DATABASE telegram_ai_agency TO teleai;
GRANT USAGE ON SCHEMA public TO teleai;
GRANT ALL ON ALL TABLES IN SCHEMA public TO teleai;
Email Security
Use Gmail App Password (not main password)
Enable 2FA on Gmail account
Consider IP whitelisting on SMTP
Monitor email logs for abuse
🐛 TROUBLESHOOTING
Issue: Database Connection Error
text

Error: connect ECONNREFUSED
Solution:

Bash

# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Restart PostgreSQL (Mac)
brew services restart postgresql

# Check connection string in .env
DATABASE_URL="postgresql://teleai:password@localhost:5432/telegram_ai_agency"
Issue: Telegram Bot Not Responding
text

Error: TELEGRAM_BOT_TOKEN is not set
Solution:

Bash

# Get token from @BotFather on Telegram
# Add to .env
TELEGRAM_BOT_TOKEN="1234567890:ABCDefGHijKLmNopQRstUVWxyz..."

# Restart app
npm start
Issue: Email Sending Failed
text

Error: Invalid login
Solution:

Bash

# 1. Generate Gmail App Password:
#    https://myaccount.google.com/apppasswords

# 2. Use 16-character password in .env
EMAIL_PASS="abcd1234efgh5678"

# 3. Enable 2FA on Gmail

# 4. Test with:
curl -X GET http://localhost:3000/health/email
Issue: Ollama Timeout
text

Error: timeout of 60000ms exceeded
Solution:

Bash

# 1. Ensure Ollama is running
ollama serve

# 2. Check phi model is installed
ollama list

# 3. Verify connection
curl http://localhost:11434/api/tags

# 4. Update .env
OLLAMA_MODEL="phi"
Issue: Out of Memory
text

Killed (memory limit exceeded)
Solution:

Bash

# 1. Use smaller model
ollama pull orca-mini
# or
ollama pull neural-chat

# 2. Update .env
OLLAMA_MODEL="orca-mini"

# 3. Check system resources
top  # Mac
htop # Linux
📈 PERFORMANCE TUNING
Email Rate Limiting
Default: 5 emails per 60 seconds

env

# Adjust in .env
EMAIL_RATE_LIMIT=10        # More aggressive
EMAIL_RATE_INTERVAL=60000  # Per 60 seconds
Database Connection Pool
Edit src/server.js if needed:

JavaScript

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
      // Add pool config if needed
    },
  },
});
AI Model Selection
Model	Speed	Memory	Quality
phi	⚡⚡⚡	2.7GB	Good
neural-chat	⚡⚡	4GB	Good
mistral	⚡	4.4GB	Excellent
llama3	⚡	4.7GB	Excellent
📚 DEVELOPMENT
Running in Development Mode
Bash

npm run dev
This uses nodemon for auto-reload on file changes.

Database Migrations
Bash

# After changing schema.prisma
npx prisma db push

# View database visually
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma db push --force-reset
Adding New Commands
Edit src/handlers/commandHandler.js:

JavaScript

this.bot.command('mycommand', this.handleMyCommand.bind(this));

async handleMyCommand(ctx) {
  try {
    // Your logic here
    await ctx.reply('Response');
  } catch (error) {
    await ctx.reply('❌ Error: ' + error.message);
  }
}
Customizing Email Templates
Edit src/services/aiService.js - emailTemplates object:

JavaScript

restaurant: {
  subject: 'Your custom subject',
  body: `Your custom email body...`
}
🚀 DEPLOYMENT
Docker Setup
Dockerfile

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "start"]
Build and run:

Bash

docker build -t ai-agency .
docker run -p 3000:3000 --env-file .env ai-agency
Environment-Specific .env Files
Bash

# Development
cp .env.example .env.development
# Edit for dev settings

# Production
cp .env.example .env.production
# Edit for prod settings

# Load appropriate env
NODE_ENV=production npm start
Production Checklist
 Set NODE_ENV=production
 Use strong database password
 Use Gmail App Password (generated)
 Enable HTTPS (Nginx reverse proxy)
 Set up PostgreSQL backups
 Configure logging/monitoring
 Set up error tracking (Sentry)
 Enable rate limiting on all endpoints
 Test email deliverability
 Test Telegram bot thoroughly
📞 SUPPORT & TROUBLESHOOTING
Check Logs
Bash

# Real-time logs
tail -f logs/app.log
tail -f logs/error.log

# All logs
cat logs/app.log
cat logs/error.log
Health Checks
Bash

# API health
curl http://localhost:3000/health

# Database health
curl http://localhost:3000/health/db

# Email service health
curl http://localhost:3000/health/email

# Ollama health
curl http://localhost:11434/api/tags
Common Commands
Bash

# Show all campaigns
/campaigns

# Show system status
/status

# View database
npx prisma studio

# Restart app
npm start

# Stop app
Ctrl+C

# View latest logs
tail -20 logs/app.log