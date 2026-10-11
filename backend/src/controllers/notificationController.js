const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get current user notifications
// @route   GET /api/notifications
const getUserNotifications = async (req, res, next) => {
  try {
    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30',
      [req.user.id]
    );

    const [unreadCountRes] = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [req.user.id]
    );

    return successResponse(res, 'Notifications fetched.', {
      notifications,
      unreadCount: unreadCountRes[0].count
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === 'all') {
      await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [req.user.id]);
      return successResponse(res, 'All notifications marked as read.');
    }

    await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [id, req.user.id]);
    return successResponse(res, 'Notification marked as read.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUserNotifications,
  markNotificationRead
};
