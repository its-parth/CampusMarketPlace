const { generateProductDescription } = require('../services/ai/descriptionService');
const { suggestProductPrice } = require('../services/ai/priceSuggestionService');
const { getPersonalizedRecommendations } = require('../services/ai/recommendationService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Generate AI product description
// @route   POST /api/ai/generate-description
const handleGenerateDescription = async (req, res, next) => {
  try {
    const { title, category, condition, keyPoints, targetPrice } = req.body;
    if (!title) {
      return errorResponse(res, 'Title is required for description generation.', null, 400);
    }

    const result = await generateProductDescription({ title, category, condition, keyPoints, targetPrice });
    return successResponse(res, 'AI product description generated.', result);
  } catch (err) {
    next(err);
  }
};

// @desc    Get AI product price suggestion
// @route   POST /api/ai/suggest-price
const handleSuggestPrice = async (req, res, next) => {
  try {
    const { title, categoryId, conditionState, originalPrice } = req.body;
    if (!title || !categoryId || !conditionState) {
      return errorResponse(res, 'Title, category, and condition are required.', null, 400);
    }

    const result = await suggestProductPrice({ title, categoryId, conditionState, originalPrice });
    return successResponse(res, 'AI price suggestion generated.', result);
  } catch (err) {
    next(err);
  }
};

// @desc    Get personalized product recommendations
// @route   GET /api/ai/recommendations
const handleGetRecommendations = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const limit = parseInt(req.query.limit || '8');

    const products = await getPersonalizedRecommendations(userId, limit);
    return successResponse(res, 'Personalized recommendations fetched.', products);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  handleGenerateDescription,
  handleSuggestPrice,
  handleGetRecommendations
};
