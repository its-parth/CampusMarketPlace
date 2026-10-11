const express = require('express');
const router = express.Router();
const {
  handleGenerateDescription,
  handleSuggestPrice,
  handleGetRecommendations
} = require('../controllers/aiController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.post('/generate-description', protect, handleGenerateDescription);
router.post('/suggest-price', protect, handleSuggestPrice);
router.get('/recommendations', optionalAuth, handleGetRecommendations);

module.exports = router;
