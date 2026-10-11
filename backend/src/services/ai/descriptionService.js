const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * AI Service for Generating Compelling Product Titles and Descriptions
 */
const generateProductDescription = async ({ title, category, condition, keyPoints, targetPrice }) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim() !== '') {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeAIModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are an expert AI copywriter for a student campus marketplace.
Generate an appealing, honest, and high-converting listing title and description for a student seller.

Item Title: "${title}"
Category: "${category || 'General'}"
Condition: "${condition || 'Used'}"
Key Details/Notes: "${keyPoints || 'Good condition'}"
Asking Price: "₹${targetPrice || 'Negotiable'}"

Provide output in JSON format with two keys:
1. "enhancedTitle": A catchy, concise product title (max 70 chars).
2. "description": A structured, 2-3 paragraph listing description emphasizing condition, course relevance (if textbook/tech), and pickup conveniency for campus buyers.

Return ONLY raw valid JSON without markdown wrapping.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();
      const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedJson);
      return {
        success: true,
        source: 'GEMINI_AI',
        enhancedTitle: parsed.enhancedTitle || title,
        description: parsed.description
      };
    } catch (err) {
      console.warn('⚠️ Gemini AI failed or key invalid, using fallback AI generator:', err.message);
    }
  }

  // Smart Built-In AI Fallback Engine
  const condTextMap = {
    'BRAND_NEW': 'in brand-new, unopened condition with original packaging.',
    'LIKE_NEW': 'in pristine, like-new condition with minimal to no signs of wear.',
    'GOOD': 'in great working condition with light cosmetic wear from normal student use.',
    'FAIR': 'in functional, fair condition with visible usage marks but 100% operational.',
    'REFURBISHED': 'fully restored and thoroughly tested for peak performance.'
  };

  const condText = condTextMap[condition] || 'in clean working condition.';

  const formattedDescription = `Selling my ${title}! It is ${condText}

Key Highlights:
• ${keyPoints ? keyPoints.split('\n').join('\n• ') : 'Well-maintained, clean, and ready for immediate use on campus.'}
• Perfect for state university students looking for a deal below retail prices.
• Asking price: ₹${targetPrice || 'negotiable'}.

Pickup available directly at the Student Union, Campus Library, or Dorm Quads. Feel free to message me with any questions or to schedule a meetup!`;

  return {
    success: true,
    source: 'SMART_ENGINE_FALLBACK',
    enhancedTitle: title.charAt(0).toUpperCase() + title.slice(1),
    description: formattedDescription
  };
};

module.exports = {
  generateProductDescription
};
