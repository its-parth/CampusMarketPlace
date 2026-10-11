const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get all categories with active product count
// @route   GET /api/categories
const getCategories = async (req, res, next) => {
  try {
    const [categories] = await pool.query(
      `SELECT c.*, COUNT(p.id) as product_count
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id AND p.status = 'AVAILABLE'
       GROUP BY c.id
       ORDER BY c.name ASC`
    );

    return successResponse(res, 'Categories retrieved successfully.', categories);
  } catch (err) {
    next(err);
  }
};

// @desc    Create new category (Admin)
// @route   POST /api/categories
const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, icon } = req.body;
    if (!name || !slug) {
      return errorResponse(res, 'Category name and slug are required.', null, 400);
    }

    const [result] = await pool.query(
      'INSERT INTO categories (name, slug, description, icon) VALUES (?, ?, ?, ?)',
      [name, slug.toLowerCase().trim(), description || null, icon || 'Grid']
    );

    return successResponse(res, 'Category created successfully!', { id: result.insertId, name, slug, description, icon }, 201);
  } catch (err) {
    next(err);
  }
};

// @desc    Update category (Admin)
// @route   PUT /api/categories/:id
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, description, icon } = req.body;

    await pool.query(
      `UPDATE categories
       SET name = COALESCE(?, name),
           slug = COALESCE(?, slug),
           description = COALESCE(?, description),
           icon = COALESCE(?, icon)
       WHERE id = ?`,
      [name, slug, description, icon, id]
    );

    return successResponse(res, 'Category updated successfully!');
  } catch (err) {
    next(err);
  }
};

// @desc    Delete category (Admin)
// @route   DELETE /api/categories/:id
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    return successResponse(res, 'Category deleted successfully!');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
