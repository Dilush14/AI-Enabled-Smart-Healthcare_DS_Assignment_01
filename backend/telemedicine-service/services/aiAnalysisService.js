const axios = require('axios');

class AIAnalysisService {
  constructor() {
    this.endpoint = 'https://api.openai.com/v1/chat/completions';
  }

  getApiKey() {
    const raw = process.env.OPENAI_API_KEY || '';
    return String(raw).trim().replace(/^"|"$/g, '');
  }

  async analyzeReport(reportType, reportContent, fileDescription) {
    try {
      const apiKey = this.getApiKey();
      if (!apiKey) {
        return this.getFallbackAnalysis(reportType, 'OPENAI_API_KEY is not configured');
      }

      const prompt = this.buildAnalysisPrompt(reportType, reportContent, fileDescription);
      const preferredModel = (process.env.OPENAI_MODEL || '').trim();
      const modelCandidates = [
        preferredModel,
        'gpt-4o-mini',
        'gpt-4.1-mini',
      ].filter(Boolean);

      let lastError = null;

      for (const model of modelCandidates) {
        try {
          const response = await axios.post(this.endpoint, {
            model,
            messages: [
              {
                role: 'system',
                content: `You are a medical analysis AI assistant. Analyze medical reports and provide comprehensive health insights.
                Respond in JSON format with: summary, keyFindings (array), riskFactors (array), suggestions (array), 
                dailyHabits (object with diet, exercise, sleep, lifestyle, medications arrays), and confidenceScore (0-100).`
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 2000
          }, {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            }
          });
      
          const analysisText = response?.data?.choices?.[0]?.message?.content;
          if (!analysisText) {
            throw new Error('AI response did not contain analysis content');
          }

          const analysis = JSON.parse(analysisText);

          return {
            ...analysis,
            confidenceScore: analysis.confidenceScore || 85,
            analyzedAt: new Date(),
            modelUsed: model,
            analysisSource: 'openai',
          };
        } catch (error) {
          lastError = error;
          const status = error?.response?.status;
          const message = error?.response?.data?.error?.message || error?.message || 'AI analysis failed';

          if (this.shouldFallback(message, status)) {
            return this.getFallbackAnalysis(reportType, message);
          }

          continue;
        }
      }

      const providerMessage = lastError?.response?.data?.error?.message;
      return this.getFallbackAnalysis(reportType, providerMessage || lastError?.message || 'AI analysis failed');
    } catch (error) {
      const providerMessage = error?.response?.data?.error?.message;
      return this.getFallbackAnalysis(reportType, providerMessage || error.message || 'AI analysis failed');
    }
  }

  shouldFallback(message, status) {
    const normalized = String(message || '').toLowerCase();
    if (status === 429 || status === 402) return true;
    return [
      'quota',
      'billing',
      'insufficient',
      'rate limit',
      'not exist',
      'does not exist',
      'permission',
      'access',
      'model',
      'unavailable',
      'timeout'
    ].some((fragment) => normalized.includes(fragment));
  }

  buildAnalysisPrompt(reportType, reportContent, fileDescription) {
    return `Analyze this medical report:
    Report Type: ${reportType}
    File Description: ${fileDescription || 'Not provided'}
    Report Content: ${reportContent || 'Image/PDF report uploaded'}
    
    Please provide a JSON response with:
    - summary: Brief overview of the report findings
    - keyFindings: Array of main findings
    - riskFactors: Array of identified risk factors
    - suggestions: Array of medical recommendations
    - dailyHabits: Object with arrays for diet, exercise, sleep, lifestyle, and medications
    - confidenceScore: Your confidence in the analysis (0-100)`;
  }

  getFallbackAnalysis(reportType, reason = '') {
    const templates = {
      lab_report: {
        summary: 'Lab report uploaded successfully. Automated guidance is based on common health maintenance patterns and should be reviewed by a clinician.',
        keyFindings: ['Report uploaded and saved', 'Automated local review completed'],
        riskFactors: ['Requires clinician review for definitive interpretation'],
        suggestions: ['Discuss the report with your doctor', 'Track any new symptoms', 'Follow up if symptoms worsen'],
        dailyHabits: {
          diet: ['Eat balanced meals with vegetables and protein', 'Limit sugary drinks'],
          exercise: ['Walk 20-30 minutes daily', 'Stretch for 5-10 minutes each morning'],
          sleep: ['Aim for 7-8 hours of sleep', 'Keep a regular sleep schedule'],
          lifestyle: ['Stay hydrated', 'Manage stress with short breaks'],
          medications: ['Take medicines only as prescribed']
        },
        confidenceScore: 65,
      },
      blood_test: {
        summary: 'Blood test uploaded. Local guidance is provided because AI analysis was not available.',
        keyFindings: ['Report uploaded and saved', 'Suggested habits generated locally'],
        riskFactors: ['Share with your healthcare provider for an exact interpretation'],
        suggestions: ['Review the results with your doctor', 'Keep follow-up appointments'],
        dailyHabits: {
          diet: ['Include iron-rich and protein-rich foods', 'Drink enough water throughout the day'],
          exercise: ['Do light to moderate activity', 'Avoid overexertion until reviewed'],
          sleep: ['Sleep 7-8 hours consistently'],
          lifestyle: ['Reduce stress', 'Avoid smoking and excess alcohol'],
          medications: ['Continue prescribed medications as directed']
        },
        confidenceScore: 63,
      },
      x_ray: {
        summary: 'X-ray uploaded. Local guidance is shown because AI quota was exceeded.',
        keyFindings: ['Report uploaded and saved', 'Automated fallback analysis used'],
        riskFactors: ['Clinical confirmation may still be needed'],
        suggestions: ['Discuss findings with your clinician', 'Seek urgent care if symptoms are severe'],
        dailyHabits: {
          diet: ['Maintain a balanced diet', 'Avoid dehydration'],
          exercise: ['Gentle movement if comfortable', 'Rest if advised by doctor'],
          sleep: ['Keep a steady sleep routine'],
          lifestyle: ['Avoid smoke exposure', 'Monitor symptoms closely'],
          medications: ['Follow prescribed treatment only']
        },
        confidenceScore: 60,
      },
      general: {
        summary: 'Report uploaded successfully. Automated local guidance is available until AI access is restored.',
        keyFindings: ['Report saved to your records', 'AI analysis fallback used'],
        riskFactors: ['Please review with a healthcare provider'],
        suggestions: ['Book a follow-up if needed', 'Monitor your symptoms'],
        dailyHabits: {
          diet: ['Prefer home-cooked balanced meals', 'Limit processed food'],
          exercise: ['Move your body daily', 'Take short walking breaks'],
          sleep: ['Get 7-8 hours of sleep'],
          lifestyle: ['Stay hydrated', 'Reduce stress where possible'],
          medications: ['Take prescribed medicine exactly as directed']
        },
        confidenceScore: 60,
      }
    };

    return {
      ...templates[reportType] || templates.general,
      analyzedAt: new Date(),
      analysisSource: 'local-fallback',
      fallbackReason: reason,
    };
  }
}

module.exports = new AIAnalysisService();
