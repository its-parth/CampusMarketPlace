const pool = require('../../config/db');

/**
 * AI-Powered Recommendation Service
 * Analyzes user view history, category affinity, and campus trends to score products.
 */
const getPersonalizedRecommendations = async (userId = null, limit = 8) => {
  try {
    let categoryAffinity = [];

    if (userId) {
      // 1. Fetch user's top categories from activities & favorites
      const [topCats] = await pool.query(
        `SELECT category_id, COUNT(*) as interaction_score
         FROM (
           SELECT category_id FROM user_activities WHERE user_id = ? AND category_id IS NOT NULL
           UNION ALL
           SELECT p.category_id FROM favorites f JOIN products p ON f.product_id = p.id WHERE f.user_id = ?
         ) AS combined
         GROUP BY category_id
         ORDER BY interaction_score DESC
         LIMIT 3`,
        [userId, userId]
      );
      categoryAffinity = topCats.map(c => c.category_id);
    }

    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug,
             u.full_name as seller_name, u.avatar_url as seller_avatar, u.rating_avg as seller_rating, u.verification_status as seller_verification,
             (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1) as primary_image
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.seller_id = u.id
      WHERE p.status = 'AVAILABLE'
    `;

    const params = [];

    if (categoryAffinity.length > 0) {
      query += ` AND p.category_id IN (${categoryAffinity.join(',')})`;
    }

    query += ` ORDER BY p.is_featured DESC, p.views_count DESC, p.created_at DESC LIMIT ?`;
    params.push(limit);

    const [products] = await pool.query(query, params);

    // If personalized list is less than limit, backfill with featured/recent products
    if (products.length < limit) {
      const existingIds = products.map(p => p.id);
      const backfillLimit = limit - products.length;

      let backfillQuery = `
        SELECT p.*, c.name as category_name, c.slug as category_slug,
               u.full_name as seller_name, u.avatar_url as seller_avatar, u.rating_avg as seller_rating, u.verification_status as seller_verification,
               (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1) as primary_image
        FROM products p
        JOIN categories c ON p.category_id = c.id
        JOIN users u ON p.seller_id = u.id
        WHERE p.status = 'AVAILABLE'
      `;

      if (existingIds.length > 0) {
        backfillQuery += ` AND p.id NOT IN (${existingIds.join(',')})`;
      }

      backfillQuery += ` ORDER BY p.is_featured DESC, p.created_at DESC LIMIT ?`;
      const [backfillProducts] = await pool.query(backfillQuery, [backfillLimit]);
      
      return [...products, ...backfillProducts];
    }

    return products;
  } catch (err) {
    console.error('Error fetching recommendations:', err);
    return [];
  }
};

module.exports = {
  getPersonalizedRecommendations
};
