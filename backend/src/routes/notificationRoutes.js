const express = require('express');
const router = express.Router();
const { getUserNotifications, markNotificationRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getUserNotifications);
router.put('/:id/read', markNotificationRead);

module.exports = router;
