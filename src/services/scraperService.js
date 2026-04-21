const logger = require('../utils/logger');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Mock lead data generator
const mockLeadDatabase = {
  restaurant: [
    { name: 'The Italian Place', email: 'info@italianplace.com', phone: '555-0101', website: 'italianplace.com' },
    { name: 'Sushi Master', email: 'contact@sushimaster.com', phone: '555-0102', website: 'sushimaster.com' },
    { name: 'Burger Junction', email: 'hello@burgerjunction.com', phone: '555-0103', website: 'burgerjunction.com' },
    { name: 'Pizza Express', email: 'info@pizzaexpress.com', phone: '555-0104', website: 'pizzaexpress.com' },
    { name: 'Taco Supreme', email: 'contact@tacoSupreme.com', phone: '555-0105', website: 'tacosupreme.com' },
    { name: 'Steakhouse Prime', email: 'reservations@steakhouseprime.com', phone: '555-0106', website: 'steakhouseprime.com' },
    { name: 'Thai Spice', email: 'info@thaispice.com', phone: '555-0107', website: 'thaispice.com' },
    { name: 'Greek Taverna', email: 'contact@greektaverna.com', phone: '555-0108', website: 'greektaverna.com' },
    { name: 'Asian Fusion', email: 'info@asianfusion.com', phone: '555-0109', website: 'asianfusion.com' },
    { name: 'Vegetarian Haven', email: 'hello@vegetarianhaven.com', phone: '555-0110', website: 'vegetarianhaven.com' }
  ],
  retail: [
    { name: 'Fashion Forward', email: 'info@fashionforward.com', phone: '555-0201', website: 'fashionforward.com' },
    { name: 'Tech Gadgets Plus', email: 'sales@techgadgetsplus.com', phone: '555-0202', website: 'techgadgetsplus.com' },
    { name: 'Home & Living', email: 'contact@homeandliving.com', phone: '555-0203', website: 'homeandliving.com' },
    { name: 'Sports Zone', email: 'info@sportszone.com', phone: '555-0204', website: 'sportszone.com' },
    { name: 'Book Nook', email: 'hello@booknook.com', phone: '555-0205', website: 'booknook.com' },
    { name: 'Electronics Hub', email: 'support@electronicshub.com', phone: '555-0206', website: 'electronicshub.com' },
    { name: 'Vintage Finds', email: 'contact@vintageFinds.com', phone: '555-0207', website: 'vintageFinds.com' },
    { name: 'Jewelry Gallery', email: 'info@jewelrygallery.com', phone: '555-0208', website: 'jewelrygallery.com' },
    { name: 'Outdoor Gear', email: 'sales@outdoorgear.com', phone: '555-0209', website: 'outdoorgear.com' },
    { name: 'Beauty Paradise', email: 'hello@beautyparadise.com', phone: '555-0210', website: 'beautyparadise.com' }
  ],
  saas: [
    { name: 'CloudSync Solutions', email: 'info@cloudsync.com', phone: '555-0301', website: 'cloudsync.com' },
    { name: 'DataVault Pro', email: 'sales@datavaultpro.com', phone: '555-0302', website: 'datavaultpro.com' },
    { name: 'Analytics Engine', email: 'contact@analyticsengine.com', phone: '555-0303', website: 'analyticsengine.com' },
    { name: 'DevOps Tools', email: 'hello@devopstools.com', phone: '555-0304', website: 'devopstools.com' },
    { name: 'CRM Master', email: 'support@crmmaster.com', phone: '555-0305', website: 'crmmaster.com' },
    { name: 'Automation Hub', email: 'info@automationhub.io', phone: '555-0306', website: 'automationhub.io' },
    { name: 'Security Suite', email: 'security@securitysuite.com', phone: '555-0307', website: 'securitysuite.com' },
    { name: 'Marketing Stack', email: 'hello@marketingstack.com', phone: '555-0308', website: 'marketingstack.com' },
    { name: 'Finance Pro', email: 'contact@financepro.com', phone: '555-0309', website: 'financepro.com' },
    { name: 'HR Connect', email: 'hr@hrconnect.com', phone: '555-0310', website: 'hrconnect.com' }
  ],
  service: [
    { name: 'Elite Cleaning Co', email: 'info@elitecleaning.com', phone: '555-0401', website: 'elitecleaning.com' },
    { name: 'Prime Plumbing', email: 'service@primeplumbing.com', phone: '555-0402', website: 'primeplumbing.com' },
    { name: 'Electric Solutions', email: 'contact@electricsolutions.com', phone: '555-0403', website: 'electricsolutions.com' },
    { name: 'HVAC Masters', email: 'hvac@hvacmasters.com', phone: '555-0404', website: 'hvacmasters.com' },
    { name: 'Landscape Design', email: 'info@landscapedesign.com', phone: '555-0405', website: 'landscapedesign.com' },
    { name: 'Security Guard Services', email: 'dispatch@securityguard.com', phone: '555-0406', website: 'securityguard.com' },
    { name: 'Mobile Car Wash', email: 'book@mobilewash.com', phone: '555-0407', website: 'mobilewash.com' },
    { name: 'Home Inspection Pro', email: 'inspect@homeinspection.com', phone: '555-0408', website: 'homeinspection.com' },
    { name: 'Pest Control Elite', email: 'service@pestcontrol.com', phone: '555-0409', website: 'pestcontrol.com' },
    { name: 'Roofing Specialists', email: 'quote@roofingspec.com', phone: '555-0410', website: 'roofingspec.com' }
  ]
};

class ScraperService {
  async scrapeLeads(businessType, location, limit = 50) {
    try {
      logger.info('Starting lead scraping', {
        businessType,
        location,
        limit
      });

      const businessTypeLower = businessType.toLowerCase();
      const leads = mockLeadDatabase[businessTypeLower] || [];

      if (leads.length === 0) {
        throw new Error(`No mock data available for business type: ${businessType}`);
      }

      // Shuffle and limit
      const shuffled = leads.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, Math.min(limit, shuffled.length));

      logger.info('Leads scraped', {
        count: selected.length,
        businessType,
        location
      });

      return selected.map(lead => ({
        ...lead,
        businessType,
        location
      }));
    } catch (error) {
      logger.error('Error scraping leads', {
        businessType,
        location,
        error: error.message
      });
      throw error;
    }
  }

  async saveLeadsToDatabase(leads, campaignId) {
    try {
      const savedLeads = [];

      for (const lead of leads) {
        try {
          // Check if lead already exists
          const existingLead = await prisma.lead.findUnique({
            where: { email: lead.email }
          });

          if (existingLead) {
            logger.debug('Lead already exists', { email: lead.email });
            continue;
          }

          const savedLead = await prisma.lead.create({
            data: {
              name: lead.name,
              email: lead.email,
              phone: lead.phone || null,
              businessType: lead.businessType,
              location: lead.location,
              website: lead.website || null,
              campaignId: campaignId
            }
          });

          savedLeads.push(savedLead);
        } catch (error) {
          logger.warn('Error saving individual lead', {
            email: lead.email,
            error: error.message
          });
        }
      }

      logger.info('Leads saved to database', {
        count: savedLeads.length,
        campaignId
      });

      return savedLeads;
    } catch (error) {
      logger.error('Error saving leads to database', {
        campaignId,
        error: error.message
      });
      throw error;
    }
  }

  async getLeadsForCampaign(campaignId) {
    try {
      const leads = await prisma.lead.findMany({
        where: { campaignId },
        include: {
          emailLogs: true,
          replyLogs: true
        }
      });

      return leads;
    } catch (error) {
      logger.error('Error getting campaign leads', {
        campaignId,
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = new ScraperService();