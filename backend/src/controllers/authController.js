const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_campus_marketplace_jwt_key_2026!', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Register a new student
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { full_name, email, password, university, student_id_number, phone } = req.body;

    if (!full_name || !email || !password) {
      return errorResponse(res, 'Please provide full name, campus email, and password.', null, 400);
    }

    // Email check
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return errorResponse(res, 'An account with this campus email already exists.', null, 400);
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role, university, student_id_number, phone, verification_status)
       VALUES (?, ?, ?, 'STUDENT', ?, ?, ?, 'UNVERIFIED')`,
      [full_name, email.toLowerCase().trim(), password_hash, university || 'State University', student_id_number || null, phone || null]
    );

    const userId = result.insertId;

    // Create welcome notification
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, 'Welcome to Campus Marketplace!', 'Account created. Please verify your student status to list items.', 'VERIFICATION', '/verify')`,
      [userId]
    );

    const token = generateToken(userId);

    const [userRows] = await pool.query(
      'SELECT id, full_name, email, role, university, verification_status, avatar_url, phone, student_id_number, bio, rating_avg, rating_count FROM users WHERE id = ?',
      [userId]
    );

    return successResponse(res, 'Registration successful!', {
      token,
      user: userRows[0]
    }, 201);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user & return JWT token
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Please provide email and password.', null, 400);
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);

    if (rows.length === 0) {
      return errorResponse(res, 'Invalid campus email or password.', null, 401);
    }

    const user = rows[0];

    if (!user.is_active) {
      return errorResponse(res, 'Account suspended by administrator.', null, 403);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return errorResponse(res, 'Invalid campus email or password.', null, 401);
    }

    const token = generateToken(user.id);
    delete user.password_hash;

    return successResponse(res, 'Login successful!', {
      token,
      user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, full_name, email, role, university, verification_status, avatar_url, phone, student_id_number, student_card_image, bio, rating_avg, rating_count, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'User not found.', null, 404);
    }

    return successResponse(res, 'User profile fetched successfully.', rows[0]);
  } catch (err) {
    next(err);
  }
};

// @desc    Submit student verification request
// @route   POST /api/auth/verify-student
const submitVerification = async (req, res, next) => {
  try {
    const { student_id_number, university } = req.body;
    let cardImageUrl = req.body.student_card_image || null;

    if (req.file) {
      cardImageUrl = `/uploads/${req.file.filename}`;
    }

    await pool.query(
      `UPDATE users
       SET student_id_number = COALESCE(?, student_id_number),
           university = COALESCE(?, university),
           student_card_image = COALESCE(?, student_card_image),
           verification_status = 'PENDING'
       WHERE id = ?`,
      [student_id_number, university, cardImageUrl, req.user.id]
    );

    // Notify admins
    const [admins] = await pool.query("SELECT id FROM users WHERE role = 'ADMIN'");
    for (let admin of admins) {
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES (?, 'New Student Verification', ?, 'VERIFICATION', '/admin/users')`,
        [admin.id, `${req.user.full_name} submitted a student ID verification request.`]
      );
    }

    return successResponse(res, 'Student verification request submitted for review!', {
      verification_status: 'PENDING'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update profile details
// @route   PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { full_name, phone, bio, university } = req.body;

    await pool.query(
      `UPDATE users
       SET full_name = COALESCE(?, full_name),
           phone = COALESCE(?, phone),
           bio = COALESCE(?, bio),
           university = COALESCE(?, university)
       WHERE id = ?`,
      [full_name, phone, bio, university, req.user.id]
    );

    const [rows] = await pool.query(
      'SELECT id, full_name, email, role, university, verification_status, avatar_url, phone, student_id_number, bio, rating_avg, rating_count FROM users WHERE id = ?',
      [req.user.id]
    );

    return successResponse(res, 'Profile updated successfully!', rows[0]);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
  submitVerification,
  updateProfile
};
