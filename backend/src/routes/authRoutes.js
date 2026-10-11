const express = require('express');
const router = express.Router();
const { register, login, getMe, submitVerification, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/verify-student', protect, upload.single('student_card'), submitVerification);
router.put('/profile', protect, updateProfile);

module.exports = router;
