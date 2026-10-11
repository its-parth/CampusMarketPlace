const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsersList,
  toggleUserActive,
  verifyStudentAccount
} = require('../controllers/adminController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

router.use(protect, requireAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsersList);
router.put('/users/:id/toggle-active', toggleUserActive);
router.put('/users/:id/verify', verifyStudentAccount);

module.exports = router;
