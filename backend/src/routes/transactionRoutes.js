const express = require('express');
const router = express.Router();
const {
  createTransaction,
  updateTransactionStatus,
  getMyPurchases,
  getMySales
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createTransaction);
router.put('/:id/status', updateTransactionStatus);
router.get('/purchases', getMyPurchases);
router.get('/sales', getMySales);

module.exports = router;
