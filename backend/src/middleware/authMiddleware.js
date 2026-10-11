const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { errorResponse } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 'Not authorized. Token missing.', null, 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_campus_marketplace_jwt_key_2026!');
    const [rows] = await pool.query(
      'SELECT id, full_name, email, role, university, verification_status, avatar_url, is_active FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'User no longer exists.', null, 401);
    }

    const user = rows[0];
    if (!user.is_active) {
      return errorResponse(res, 'Your account has been suspended by administration.', null, 403);
    }

    req.user = user;
    next();
  } catch (err) {
    return errorResponse(res, 'Token verification failed. Please login again.', err.message, 401);
  }
};

const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_campus_marketplace_jwt_key_2026!');
    const [rows] = await pool.query(
      'SELECT id, full_name, email, role, university, verification_status, avatar_url, is_active FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length > 0 && rows[0].is_active) {
      req.user = rows[0];
    } else {
      req.user = null;
    }
  } catch (err) {
    req.user = null;
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    return errorResponse(res, 'Access denied. Administrator privileges required.', null, 403);
  }
};

const requireVerifiedStudent = (req, res, next) => {
  if (req.user && (req.user.verification_status === 'VERIFIED' || req.user.role === 'ADMIN')) {
    next();
  } else {
    return errorResponse(res, 'Verification required. Please submit student ID verification first.', null, 403);
  }
};

module.exports = {
  protect,
  optionalAuth,
  requireAdmin,
  requireVerifiedStudent
};
