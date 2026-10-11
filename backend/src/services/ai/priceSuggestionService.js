const pool = require('../../config/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * AI Price Suggestion Service based on campus market data & AI analytics
 */
const suggestProductPrice = async ({ title, categoryId, conditionState, originalPrice }) => {
  const apiKey = process.env.GEMINI_API_KEY;

  // 1. Fetch category stats from DB for market grounding
  let avgCategoryPrice = 50.00;
  try {
    const [rows] = await pool.query(
      'SELECT AVG(price) as avg_price, MIN(price) as min_p, MAX(price) as max_p FROM products WHERE category_id = ? AND status = "AVAILABLE"',
      [categoryId]
    );
    if (rows.length > 0 && rows[0].avg_price) {
      avgCategoryPrice = parseFloat(rows[0].avg_price);
    }
  } catch (err) {
    console.error('Error fetching market stats:', err);
  }

  // Calculate baseline multiplier based on condition
  const conditionMultipliers = {
    'BRAND_NEW': 0.80,
    'LIKE_NEW': 0.65,
    'GOOD': 0.50,
    'FAIR': 0.35,
    'REFURBISHED': 0.55
  };

  const mult = conditionMultipliers[conditionState] || 0.50;
  let basePrice = originalPrice ? parseFloat(originalPrice) * mult : avgCategoryPrice;

  // Ensure reasonable bounds
  const minSuggested = Math.max(5, Math.round(basePrice * 0.85));
  const recommendedSuggested = Math.max(5, Math.round(basePrice));
  const maxSuggested = Math.max(10, Math.round(basePrice * 1.15));

  if (apiKey && apiKey.trim() !== '') {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeAIModel({ model: 'gemini-1.5-flash' });

      const prompt = `Act as a campus marketplace pricing expert.
Analyze item: "${title}"
Condition: "${conditionState}"
Original Retail Price: "₹${originalPrice || 'N/A'}"
Average Campus Category Price: "₹${avgCategoryPrice.toFixed(2)}"

Provide pricing guidance in JSON:
{
  "minPrice": number,
  "recommendedPrice": number,
  "maxPrice": number,
  "reasoning": "1-2 sentence explanation of why this price point will sell quickly to fellow students."
}

Return ONLY raw JSON.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim().replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);

      return {
        success: true,
        source: 'GEMINI_AI',
        minPrice: parsed.minPrice || minSuggested,
        recommendedPrice: parsed.recommendedPrice || recommendedSuggested,
        maxPrice: parsed.maxPrice || maxSuggested,
        reasoning: parsed.reasoning || `Based on ${conditionState} condition and campus demand.`
      };
    } catch (err) {
      console.warn('Gemini Price AI fallback triggered:', err.message);
    }
  }

  return {
    success: true,
    source: 'SMART_ENGINE_FALLBACK',
    minPrice: minSuggested,
    recommendedPrice: recommendedSuggested,
    maxPrice: maxSuggested,
    reasoning: `Suggested based on ${conditionState.replace('_', ' ').toLowerCase()} condition and current active campus listings in this category.`
  };
};

module.exports = {
  suggestProductPrice
};
