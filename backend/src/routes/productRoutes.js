const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleFavorite,
  getMyFavorites,
  getMyListings
} = require('../controllers/productController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', optionalAuth, getProducts);
router.get('/favorites/my', protect, getMyFavorites);
router.get('/seller/my-listings', protect, getMyListings);
router.get('/:id', optionalAuth, getProductById);
router.post('/', protect, upload.array('images', 5), createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);
router.post('/:id/favorite', protect, toggleFavorite);

module.exports = router;
