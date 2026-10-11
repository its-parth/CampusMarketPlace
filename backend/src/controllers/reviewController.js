const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Submit review for a completed transaction
// @route   POST /api/reviews
const createReview = async (req, res, next) => {
  try {
    const { transaction_id, rating, comment } = req.body;
    const reviewerId = req.user.id;

    if (!transaction_id || !rating || rating < 1 || rating > 5) {
      return errorResponse(res, 'Transaction ID and valid rating (1-5) are required.', null, 400);
    }

    const [txRows] = await pool.query('SELECT buyer_id, seller_id, status FROM transactions WHERE id = ?', [transaction_id]);
    if (txRows.length === 0) {
      return errorResponse(res, 'Transaction record not found.', null, 404);
    }

    const tx = txRows[0];

    if (tx.status !== 'COMPLETED') {
      return errorResponse(res, 'Reviews can only be submitted for completed transactions.', null, 400);
    }

    if (tx.buyer_id !== reviewerId && tx.seller_id !== reviewerId) {
      return errorResponse(res, 'Unauthorized to review this transaction.', null, 403);
    }

    const revieweeId = tx.buyer_id === reviewerId ? tx.seller_id : tx.buyer_id;

    // Check duplicate
    const [existing] = await pool.query('SELECT id FROM reviews WHERE transaction_id = ? AND reviewer_id = ?', [transaction_id, reviewerId]);
    if (existing.length > 0) {
      return errorResponse(res, 'You have already submitted feedback for this transaction.', null, 400);
    }

    await pool.query(
      `INSERT INTO reviews (transaction_id, reviewer_id, reviewee_id, rating, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [transaction_id, reviewerId, revieweeId, rating, comment || null]
    );

    // Recalculate average rating for reviewee
    const [stats] = await pool.query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as count_rating FROM reviews WHERE reviewee_id = ?',
      [revieweeId]
    );

    const newAvg = parseFloat(stats[0].avg_rating || 0).toFixed(2);
    const newCount = stats[0].count_rating || 0;

    await pool.query(
      'UPDATE users SET rating_avg = ?, rating_count = ? WHERE id = ?',
      [newAvg, newCount, revieweeId]
    );

    return successResponse(res, 'Thank you for your rating and feedback!', { rating, comment }, 201);
  } catch (err) {
    next(err);
  }
};

// @desc    Get seller reviews
// @route   GET /api/reviews/seller/:sellerId
const getSellerReviews = async (req, res, next) => {
  try {
    const { sellerId } = req.params;

    const [reviews] = await pool.query(
      `SELECT r.*, reviewer.full_name as reviewer_name, reviewer.avatar_url as reviewer_avatar
       FROM reviews r
       JOIN users reviewer ON r.reviewer_id = reviewer.id
       WHERE r.reviewee_id = ?
       ORDER BY r.created_at DESC`,
      [sellerId]
    );

    return successResponse(res, 'Reviews fetched successfully.', reviews);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createReview,
  getSellerReviews
};
