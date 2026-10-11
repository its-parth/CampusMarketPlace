const express = require('express');
const router = express.Router();
const { createReview, getSellerReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/seller/:sellerId', getSellerReviews);
router.post('/', protect, createReview);

module.exports = router;
