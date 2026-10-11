const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get Admin Dashboard Stats & Activity Overview
// @route   GET /api/admin/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    const [userCount] = await pool.query('SELECT COUNT(*) as total FROM users');
    const [verifiedCount] = await pool.query('SELECT COUNT(*) as total FROM users WHERE verification_status = "VERIFIED"');
    const [pendingVerificationCount] = await pool.query('SELECT COUNT(*) as total FROM users WHERE verification_status = "PENDING"');
    
    const [productCount] = await pool.query('SELECT COUNT(*) as total FROM products');
    const [activeProductCount] = await pool.query('SELECT COUNT(*) as total FROM products WHERE status = "AVAILABLE"');
    const [soldProductCount] = await pool.query('SELECT COUNT(*) as total FROM products WHERE status = "SOLD"');
    
    const [transactionCount] = await pool.query('SELECT COUNT(*) as total FROM transactions');
    const [totalVolume] = await pool.query('SELECT SUM(agreed_price) as total FROM transactions WHERE status = "COMPLETED"');
    
    const [pendingReportsCount] = await pool.query('SELECT COUNT(*) as total FROM reports WHERE status = "PENDING"');

    // Recent Users
    const [recentUsers] = await pool.query(
      'SELECT id, full_name, email, role, verification_status, created_at FROM users ORDER BY created_at DESC LIMIT 5'
    );

    // Recent Products
    const [recentProducts] = await pool.query(
      `SELECT p.id, p.title, p.price, p.status, p.created_at, u.full_name as seller_name
       FROM products p
       JOIN users u ON p.seller_id = u.id
       ORDER BY p.created_at DESC LIMIT 5`
    );

    // Category Distribution
    const [categoryDistribution] = await pool.query(
      `SELECT c.name, COUNT(p.id) as count
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id
       GROUP BY c.id ORDER BY count DESC`
    );

    return successResponse(res, 'Admin stats retrieved successfully.', {
      kpis: {
        totalUsers: userCount[0].total,
        verifiedStudents: verifiedCount[0].total,
        pendingVerifications: pendingVerificationCount[0].total,
        totalProducts: productCount[0].total,
        activeListings: activeProductCount[0].total,
        soldListings: soldProductCount[0].total,
        totalTransactions: transactionCount[0].total,
        totalVolumeUSD: parseFloat(totalVolume[0].total || 0),
        pendingReports: pendingReportsCount[0].total
      },
      recentUsers,
      recentProducts,
      categoryDistribution
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users list (Admin)
// @route   GET /api/admin/users
const getUsersList = async (req, res, next) => {
  try {
    const [users] = await pool.query(
      `SELECT id, full_name, email, role, university, student_id_number, verification_status, student_card_image, rating_avg, is_active, created_at
       FROM users
       ORDER BY created_at DESC`
    );

    return successResponse(res, 'User list fetched.', users);
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle user active/suspended state
// @route   PUT /api/admin/users/:id/toggle-active
const toggleUserActive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [user] = await pool.query('SELECT is_active, full_name FROM users WHERE id = ?', [id]);
    if (user.length === 0) {
      return errorResponse(res, 'User not found.', null, 404);
    }

    const newStatus = !user[0].is_active;
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, id]);

    return successResponse(res, `User account ${newStatus ? 'activated' : 'suspended'}.`, { is_active: newStatus });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve or reject student verification
// @route   PUT /api/admin/users/:id/verify
const verifyStudentAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body; // 'VERIFIED' or 'REJECTED'

    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      return errorResponse(res, 'Status must be VERIFIED or REJECTED.', null, 400);
    }

    await pool.query('UPDATE users SET verification_status = ? WHERE id = ?', [status, id]);

    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, 'Verification Status Update', ?, 'VERIFICATION', '/profile')`,
      [id, status === 'VERIFIED' ? 'Congratulations! Your student ID has been verified.' : `Verification rejected. Note: ${note || 'Invalid card image.'}`]
    );

    return successResponse(res, `Student verification set to ${status}.`);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getUsersList,
  toggleUserActive,
  verifyStudentAccount
};
