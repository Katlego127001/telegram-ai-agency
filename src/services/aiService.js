const axios = require('axios');
const logger = require('../utils/logger');

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'phi';

class AIService {
  async generateText(prompt, maxTokens = 200) {
    try {
      logger.debug('Generating text', { model: OLLAMA_MODEL });

      const response = await axios.post(
        `${OLLAMA_BASE_URL}/api/generate`,
        {
          model: OLLAMA_MODEL,
          prompt: prompt,
          stream: false,
          options: {
            num_predict: maxTokens,
            temperature: 0.7
          }
        },
        { timeout: 45000 } // 45 seconds
      );

      const generatedText = response.data.response.trim();
      logger.info('Text generated successfully');
      return generatedText;
    } catch (error) {
      logger.error('Error generating text', { error: error.message });
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }

  async classifyText(text, category = 'intent') {
    try {
      logger.debug('Classifying text', { category });

      let prompt;
      if (category === 'intent') {
        prompt = `Classify email as: interested, not_interested, follow_up
Email: "${text}"
Answer: {"intent": "interested", "confidence": 0.9}`;
      }

      const response = await axios.post(
        `${OLLAMA_BASE_URL}/api/generate`,
        {
          model: OLLAMA_MODEL,
          prompt: prompt,
          stream: false,
          options: {
            num_predict: 30,
            temperature: 0.1
          }
        },
        { timeout: 30000 }
      );

      let result = response.data.response.trim();
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        try {
          result = JSON.parse(jsonMatch[0]);
        } catch (e) {
          result = { intent: 'follow_up', confidence: 0.5 };
        }
      } else {
        result = { intent: 'follow_up', confidence: 0.5 };
      }

      logger.info('Text classified successfully');
      return result;
    } catch (error) {
      logger.error('Error classifying text', { error: error.message });
      return { intent: 'follow_up', confidence: 0 };
    }
  }

  async generateOutreachEmail(businessType, location, productService = 'AI Automation') {
    try {
      logger.debug('Generating email', { businessType });

      const prompt = `Write a SHORT cold email (80-100 words) for a ${businessType} business offering ${productService}.

Format:
SUBJECT: [subject line]
BODY: [email body]

SUBJECT: `;

      const response = await axios.post(
        `${OLLAMA_BASE_URL}/api/generate`,
        {
          model: OLLAMA_MODEL,
          prompt: prompt,
          stream: false,
          options: {
            num_predict: 120,
            temperature: 0.8
          }
        },
        { timeout: 45000 }
      );

      const result = response.data.response.trim();
      const lines = result.split('\n');
      
      let subject = lines[0]?.trim() || `${productService} for Your ${businessType}`;
      let body = lines.slice(1).join('\n').replace('BODY:', '').trim();

      if (!body) {
        body = `Hi,\n\nWe help ${businessType}s like you with ${productService}.\n\nInterested in a quick call?\n\nBest regards`;
      }

      logger.info('Email generated successfully');
      return {
        subject: subject || `Boost Your ${businessType} Business`,
        body: body
      };
    } catch (error) {
      logger.error('Error generating email', { error: error.message });
      // Return fallback email
      return {
        subject: `${productService} for Your ${businessType}`,
        body: `Hi,\n\nWe offer ${productService} solutions for ${businessType}s.\n\nWould you be interested in learning more?\n\nBest regards`
      };
    }
  }

  async getInsights(question, context = {}) {
    try {
      const prompt = `Answer this sales question briefly (50 words max):

Stats: ${context.emailsSent} emails sent, ${context.replies} replies, ${context.conversionRate} conversion.

Question: ${question}

Answer:`;

      const response = await axios.post(
        `${OLLAMA_BASE_URL}/api/generate`,
        {
          model: OLLAMA_MODEL,
          prompt: prompt,
          stream: false,
          options: {
            num_predict: 100,
            temperature: 0.7
          }
        },
        { timeout: 30000 }
      );

      logger.info('Insights generated');
      return response.data.response.trim();
    } catch (error) {
      logger.error('Error generating insights', { error: error.message });
      return `Based on your ${context.emailsSent} emails sent with ${context.replies} replies (${context.conversionRate}), focus on improving subject lines and follow-up timing.`;
    }
  }
}

module.exports = new AIService();