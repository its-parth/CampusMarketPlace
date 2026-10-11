const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Initiate transaction / buy offer
// @route   POST /api/transactions
const createTransaction = async (req, res, next) => {
  try {
    const { product_id, agreed_price, meetup_location, meetup_time, notes } = req.body;
    const buyerId = req.user.id;

    if (!product_id || !agreed_price) {
      return errorResponse(res, 'Product ID and agreed price are required.', null, 400);
    }

    const [prodRows] = await pool.query('SELECT seller_id, title, status FROM products WHERE id = ?', [product_id]);
    if (prodRows.length === 0) {
      return errorResponse(res, 'Product listing not found.', null, 404);
    }

    const product = prodRows[0];
    if (product.seller_id === buyerId) {
      return errorResponse(res, 'You cannot buy your own product listing.', null, 400);
    }

    if (product.status !== 'AVAILABLE') {
      return errorResponse(res, `This item is already ${product.status.toLowerCase()}.`, null, 400);
    }

    const [result] = await pool.query(
      `INSERT INTO transactions (product_id, buyer_id, seller_id, agreed_price, status, meetup_location, meetup_time, notes)
       VALUES (?, ?, ?, ?, 'PENDING', ?, ?, ?)`,
      [product_id, buyerId, product.seller_id, parseFloat(agreed_price), meetup_location || 'Campus Student Union', meetup_time || null, notes || null]
    );

    const transactionId = result.insertId;

    // Send notification to seller
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, 'New Purchase Request', ?, 'TRANSACTION', '/sales')`,
      [product.seller_id, `${req.user.full_name} submitted a ₹${agreed_price} offer for "${product.title}".`]
    );

    return successResponse(res, 'Transaction request sent to seller!', { id: transactionId }, 201);
  } catch (err) {
    next(err);
  }
};

// @desc    Update transaction status (ACCEPTED, COMPLETED, CANCELLED)
// @route   PUT /api/transactions/:id/status
const updateTransactionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, meetup_location, meetup_time } = req.body;
    const userId = req.user.id;

    const [txRows] = await pool.query(
      `SELECT t.*, p.title as product_title, p.id as product_id
       FROM transactions t
       JOIN products p ON t.product_id = p.id
       WHERE t.id = ?`,
      [id]
    );

    if (txRows.length === 0) {
      return errorResponse(res, 'Transaction record not found.', null, 404);
    }

    const tx = txRows[0];
    if (tx.buyer_id !== userId && tx.seller_id !== userId && req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Unauthorized access to transaction.', null, 403);
    }

    let completedAt = null;

    if (status === 'ACCEPTED') {
      // Mark product RESERVED
      await pool.query('UPDATE products SET status = "RESERVED" WHERE id = ?', [tx.product_id]);
    } else if (status === 'COMPLETED') {
      // Mark product SOLD
      await pool.query('UPDATE products SET status = "SOLD" WHERE id = ?', [tx.product_id]);
      completedAt = new Date();
    } else if (status === 'CANCELLED') {
      // Revert product AVAILABLE
      await pool.query('UPDATE products SET status = "AVAILABLE" WHERE id = ?', [tx.product_id]);
    }

    await pool.query(
      `UPDATE transactions
       SET status = ?,
           meetup_location = COALESCE(?, meetup_location),
           meetup_time = COALESCE(?, meetup_time),
           completed_at = COALESCE(?, completed_at)
       WHERE id = ?`,
      [status, meetup_location, meetup_time, completedAt, id]
    );

    // Notify other party
    const targetUserId = tx.buyer_id === userId ? tx.seller_id : tx.buyer_id;
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, 'Transaction Update', ?, 'TRANSACTION', '/purchases')`,
      [targetUserId, `Transaction status for "${tx.product_title}" updated to ${status}.`]
    );

    return successResponse(res, `Transaction status updated to ${status}.`);
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's purchase history (Buyer)
// @route   GET /api/transactions/purchases
const getMyPurchases = async (req, res, next) => {
  try {
    const [purchases] = await pool.query(
      `SELECT t.*, p.title as product_title, p.price as product_price,
              (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as product_image,
              seller.full_name as seller_name, seller.avatar_url as seller_avatar, seller.email as seller_email, seller.phone as seller_phone,
              r.id as review_id, r.rating, r.comment as review_comment
       FROM transactions t
       JOIN products p ON t.product_id = p.id
       JOIN users seller ON t.seller_id = seller.id
       LEFT JOIN reviews r ON t.id = r.transaction_id
       WHERE t.buyer_id = ?
       ORDER BY t.created_at DESC`,
      [req.user.id]
    );

    return successResponse(res, 'Purchases retrieved successfully.', purchases);
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's sales history (Seller)
// @route   GET /api/transactions/sales
const getMySales = async (req, res, next) => {
  try {
    const [sales] = await pool.query(
      `SELECT t.*, p.title as product_title, p.price as product_price,
              (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as product_image,
              buyer.full_name as buyer_name, buyer.avatar_url as buyer_avatar, buyer.email as buyer_email, buyer.phone as buyer_phone,
              r.id as review_id, r.rating, r.comment as review_comment
       FROM transactions t
       JOIN products p ON t.product_id = p.id
       JOIN users buyer ON t.buyer_id = buyer.id
       LEFT JOIN reviews r ON t.id = r.transaction_id
       WHERE t.seller_id = ?
       ORDER BY t.created_at DESC`,
      [req.user.id]
    );

    return successResponse(res, 'Sales history retrieved successfully.', sales);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTransaction,
  updateTransactionStatus,
  getMyPurchases,
  getMySales
};
