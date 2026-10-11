const express = require('express');
const router = express.Router();
const { submitReport, getReports, updateReportStatus } = require('../controllers/reportController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

router.post('/', protect, submitReport);
router.get('/', protect, requireAdmin, getReports);
router.put('/:id/status', protect, requireAdmin, updateReportStatus);

module.exports = router;
