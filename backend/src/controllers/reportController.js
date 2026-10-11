const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Submit report against product or user
// @route   POST /api/reports
const submitReport = async (req, res, next) => {
  try {
    const { target_type, target_id, reason, description } = req.body;
    const reporterId = req.user.id;

    if (!target_type || !target_id || !reason || !description) {
      return errorResponse(res, 'Target type, target ID, reason, and detailed description are required.', null, 400);
    }

    const [result] = await pool.query(
      `INSERT INTO reports (reporter_id, target_type, target_id, reason, description, status)
       VALUES (?, ?, ?, ?, ?, 'PENDING')`,
      [reporterId, target_type, target_id, reason, description]
    );

    // Notify admins
    const [admins] = await pool.query("SELECT id FROM users WHERE role = 'ADMIN'");
    for (let admin of admins) {
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES (?, 'New Flagged Item Report', ?, 'SYSTEM', '/admin/reports')`,
        [admin.id, `Report submitted regarding ${target_type} #${target_id}: "${reason}".`]
      );
    }

    return successResponse(res, 'Report submitted to campus moderation team.', { id: result.insertId }, 201);
  } catch (err) {
    next(err);
  }
};

// @desc    Get all reports (Admin)
// @route   GET /api/reports
const getReports = async (req, res, next) => {
  try {
    const [reports] = await pool.query(
      `SELECT r.*, reporter.full_name as reporter_name, reporter.email as reporter_email
       FROM reports r
       JOIN users reporter ON r.reporter_id = reporter.id
       ORDER BY r.created_at DESC`
    );

    // Enhance target & seller details
    for (let rep of reports) {
      if (rep.target_type === 'PRODUCT') {
        const [p] = await pool.query(
          `SELECT p.id as product_id, p.title, p.status, p.price, p.seller_id,
                  u.full_name as seller_name, u.email as seller_email, u.is_active as seller_active
           FROM products p
           JOIN users u ON p.seller_id = u.id
           WHERE p.id = ?`,
          [rep.target_id]
        );
        rep.target_detail = p.length > 0 ? p[0] : { title: 'Deleted Product', status: 'N/A', seller_id: null, seller_name: 'Unknown', seller_email: 'N/A' };
      } else {
        const [u] = await pool.query(
          `SELECT id as user_id, full_name as user_name, email as user_email, is_active, verification_status
           FROM users WHERE id = ?`,
          [rep.target_id]
        );
        rep.target_detail = u.length > 0 ? u[0] : { user_id: rep.target_id, user_name: 'Deleted User', user_email: 'N/A' };
      }
    }

    return successResponse(res, 'Reports fetched successfully.', reports);
  } catch (err) {
    next(err);
  }
};

// @desc    Update report status (Admin)
// @route   PUT /api/reports/:id/status
const updateReportStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, action_taken } = req.body;

    await pool.query(
      `UPDATE reports
       SET status = COALESCE(?, status),
           action_taken = COALESCE(?, action_taken)
       WHERE id = ?`,
      [status, action_taken, id]
    );

    return successResponse(res, `Report marked as ${status}.`);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitReport,
  getReports,
  updateReportStatus
};
