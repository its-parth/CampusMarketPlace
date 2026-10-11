const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { parseSearchQuery } = require('../services/ai/searchService');

// @desc    Get products with search, filtering, sorting, pagination
// @route   GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '12');
    const offset = (page - 1) * limit;

    const { category, condition, minPrice, maxPrice, campus, sort, search, status } = req.query;

    let whereConditions = [];
    let params = [];

    // Default status filter to AVAILABLE unless specified or viewing my listings
    if (status) {
      whereConditions.push('p.status = ?');
      params.push(status);
    } else {
      whereConditions.push('p.status = "AVAILABLE"');
    }

    if (category) {
      whereConditions.push('(c.slug = ? OR c.id = ?)');
      params.push(category, category);
    }

    if (condition) {
      whereConditions.push('p.condition_state = ?');
      params.push(condition);
    }

    if (campus) {
      whereConditions.push('p.campus_location LIKE ?');
      params.push(`%${campus}%`);
    }

    if (minPrice) {
      whereConditions.push('p.price >= ?');
      params.push(parseFloat(minPrice));
    }

    // AI Smart Search parsing
    let searchParsed = parseSearchQuery(search);
    if (searchParsed.cleanQuery) {
      whereConditions.push('(p.title LIKE ? OR p.description LIKE ? OR c.name LIKE ?)');
      const q = `%${searchParsed.cleanQuery}%`;
      params.push(q, q, q);
    }

    if (searchParsed.priceMax && !maxPrice) {
      whereConditions.push('p.price <= ?');
      params.push(searchParsed.priceMax);
    } else if (maxPrice) {
      whereConditions.push('p.price <= ?');
      params.push(parseFloat(maxPrice));
    }

    if (searchParsed.extractedCondition && !condition) {
      whereConditions.push('p.condition_state = ?');
      params.push(searchParsed.extractedCondition);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    let orderBy = 'ORDER BY p.is_featured DESC, p.created_at DESC';
    if (sort === 'price_asc') orderBy = 'ORDER BY p.price ASC';
    if (sort === 'price_desc') orderBy = 'ORDER BY p.price DESC';
    if (sort === 'oldest') orderBy = 'ORDER BY p.created_at ASC';
    if (sort === 'popular') orderBy = 'ORDER BY p.views_count DESC';

    // Count query
    const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;
    const [countRes] = await pool.query(countQuery, params);
    const totalItems = countRes[0].total;

    // Main query
    const mainQuery = `
      SELECT p.*, c.name as category_name, c.slug as category_slug,
             u.full_name as seller_name, u.avatar_url as seller_avatar, u.rating_avg as seller_rating, u.verification_status as seller_verification,
             (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1) as primary_image
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.seller_id = u.id
      ${whereClause}
      ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const [products] = await pool.query(mainQuery, [...params, limit, offset]);

    // If user is logged in, attach is_favorite flag
    if (req.user) {
      const [userFavs] = await pool.query('SELECT product_id FROM favorites WHERE user_id = ?', [req.user.id]);
      const favSet = new Set(userFavs.map(f => f.product_id));
      products.forEach(p => {
        p.is_favorite = favSet.has(p.id);
      });
    }

    return successResponse(res, 'Products retrieved successfully.', {
      products,
      pagination: {
        total: totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single product by ID with all images & seller profile
// @route   GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Increment views
    await pool.query('UPDATE products SET views_count = views_count + 1 WHERE id = ?', [id]);

    const [rows] = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug,
              u.id as seller_id, u.full_name as seller_name, u.email as seller_email, u.avatar_url as seller_avatar, u.rating_avg as seller_rating, u.rating_count as seller_rating_count, u.verification_status as seller_verification, u.university as seller_university, u.created_at as seller_joined
       FROM products p
       JOIN categories c ON p.category_id = c.id
       JOIN users u ON p.seller_id = u.id
       WHERE p.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'Product listing not found.', null, 404);
    }

    const product = rows[0];

    // Fetch images
    const [images] = await pool.query('SELECT id, image_url, is_primary FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, id ASC', [id]);
    product.images = images;

    // Check favorite status for auth user
    product.is_favorite = false;
    if (req.user) {
      const [fav] = await pool.query('SELECT id FROM favorites WHERE user_id = ? AND product_id = ?', [req.user.id, id]);
      product.is_favorite = fav.length > 0;

      // Track view activity for AI recommendations
      await pool.query(
        'INSERT INTO user_activities (user_id, activity_type, product_id, category_id) VALUES (?, "VIEW", ?, ?)',
        [req.user.id, id, product.category_id]
      );
    }

    return successResponse(res, 'Product details fetched successfully.', product);
  } catch (err) {
    next(err);
  }
};

// @desc    Create new product listing
// @route   POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const { title, description, category_id, price, original_price, condition_state, campus_location, images } = req.body;

    if (!title || !description || !category_id || !price || !condition_state) {
      return errorResponse(res, 'Title, description, category, price, and condition are required.', null, 400);
    }

    const [result] = await pool.query(
      `INSERT INTO products (seller_id, category_id, title, description, price, original_price, condition_state, campus_location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        category_id,
        title,
        description,
        parseFloat(price),
        original_price ? parseFloat(original_price) : null,
        condition_state,
        campus_location || req.user.university || 'Main Campus'
      ]
    );

    const productId = result.insertId;

    // Save image URLs
    let imageList = [];
    if (req.files && req.files.length > 0) {
      imageList = req.files.map(f => `/uploads/${f.filename}`);
    } else if (images && Array.isArray(images) && images.length > 0) {
      imageList = images;
    } else {
      imageList = ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'];
    }

    for (let idx = 0; idx < imageList.length; idx++) {
      await pool.query(
        'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
        [productId, imageList[idx], idx === 0]
      );
    }

    return successResponse(res, 'Product listing created successfully!', { id: productId }, 201);
  } catch (err) {
    next(err);
  }
};

// @desc    Update existing product listing
// @route   PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, category_id, price, original_price, condition_state, status, campus_location } = req.body;

    const [existing] = await pool.query('SELECT seller_id FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return errorResponse(res, 'Product listing not found.', null, 404);
    }

    if (existing[0].seller_id !== req.user.id && req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Unauthorized to edit this listing.', null, 403);
    }

    await pool.query(
      `UPDATE products
       SET title = COALESCE(?, title),
           description = COALESCE(?, description),
           category_id = COALESCE(?, category_id),
           price = COALESCE(?, price),
           original_price = COALESCE(?, original_price),
           condition_state = COALESCE(?, condition_state),
           status = COALESCE(?, status),
           campus_location = COALESCE(?, campus_location)
       WHERE id = ?`,
      [title, description, category_id, price, original_price, condition_state, status, campus_location, id]
    );

    return successResponse(res, 'Product updated successfully!');
  } catch (err) {
    next(err);
  }
};

// @desc    Delete product listing
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT seller_id FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return errorResponse(res, 'Product listing not found.', null, 404);
    }

    if (existing[0].seller_id !== req.user.id && req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Unauthorized to delete this listing.', null, 403);
    }

    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    return successResponse(res, 'Product listing deleted.');
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle product in user favorites
// @route   POST /api/products/:id/favorite
const toggleFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id FROM favorites WHERE user_id = ? AND product_id = ?', [req.user.id, id]);

    if (existing.length > 0) {
      await pool.query('DELETE FROM favorites WHERE user_id = ? AND product_id = ?', [req.user.id, id]);
      await pool.query('UPDATE products SET favorites_count = GREATEST(0, favorites_count - 1) WHERE id = ?', [id]);
      return successResponse(res, 'Removed from favorites.', { is_favorite: false });
    } else {
      await pool.query('INSERT INTO favorites (user_id, product_id) VALUES (?, ?)', [req.user.id, id]);
      await pool.query('UPDATE products SET favorites_count = favorites_count + 1 WHERE id = ?', [id]);

      // Track favorite activity for AI recommendations
      const [prod] = await pool.query('SELECT category_id FROM products WHERE id = ?', [id]);
      if (prod.length > 0) {
        await pool.query(
          'INSERT INTO user_activities (user_id, activity_type, product_id, category_id) VALUES (?, "FAVORITE", ?, ?)',
          [req.user.id, id, prod[0].category_id]
        );
      }

      return successResponse(res, 'Saved to favorites!', { is_favorite: true });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user's favorites
// @route   GET /api/products/favorites/my
const getMyFavorites = async (req, res, next) => {
  try {
    const [products] = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug,
              u.full_name as seller_name, u.avatar_url as seller_avatar, u.rating_avg as seller_rating,
              (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1) as primary_image
       FROM favorites f
       JOIN products p ON f.product_id = p.id
       JOIN categories c ON p.category_id = c.id
       JOIN users u ON p.seller_id = u.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );

    products.forEach(p => p.is_favorite = true);

    return successResponse(res, 'Favorites retrieved successfully.', products);
  } catch (err) {
    next(err);
  }
};

// @desc    Get current seller's own listings
// @route   GET /api/products/seller/my-listings
const getMyListings = async (req, res, next) => {
  try {
    const [products] = await pool.query(
      `SELECT p.*, c.name as category_name,
              (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1) as primary_image
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.seller_id = ?
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );

    return successResponse(res, 'My listings fetched.', products);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleFavorite,
  getMyFavorites,
  getMyListings
};
