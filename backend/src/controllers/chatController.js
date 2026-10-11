const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get or create conversation for product
// @route   POST /api/conversations
const createOrGetConversation = async (req, res, next) => {
  try {
    const { product_id } = req.body;
    if (!product_id) {
      return errorResponse(res, 'Product ID is required.', null, 400);
    }

    const [productRows] = await pool.query('SELECT id, seller_id, title FROM products WHERE id = ?', [product_id]);
    if (productRows.length === 0) {
      return errorResponse(res, 'Product not found.', null, 404);
    }

    const product = productRows[0];
    if (product.seller_id === req.user.id) {
      return errorResponse(res, 'You cannot start a conversation with yourself on your own product listing.', null, 400);
    }

    // Check existing
    const [existing] = await pool.query(
      'SELECT id FROM conversations WHERE product_id = ? AND buyer_id = ? AND seller_id = ?',
      [product_id, req.user.id, product.seller_id]
    );

    let conversationId;

    if (existing.length > 0) {
      conversationId = existing[0].id;
    } else {
      const [result] = await pool.query(
        'INSERT INTO conversations (product_id, buyer_id, seller_id) VALUES (?, ?, ?)',
        [product_id, req.user.id, product.seller_id]
      );
      conversationId = result.insertId;
    }

    return successResponse(res, 'Conversation created/retrieved.', { id: conversationId });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user conversations list
// @route   GET /api/conversations
const getUserConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [conversations] = await pool.query(
      `SELECT c.id, c.product_id, c.buyer_id, c.seller_id, c.last_message_at, c.created_at,
              p.title as product_title, p.price as product_price, p.status as product_status,
              (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as product_image,
              other_user.id as other_user_id, other_user.full_name as other_user_name, other_user.avatar_url as other_user_avatar, other_user.verification_status as other_user_verification,
              (SELECT message_text FROM messages WHERE conversation_id = c.id ORDER BY id DESC LIMIT 1) as last_message,
              (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ? AND is_read = FALSE) as unread_count
       FROM conversations c
       JOIN products p ON c.product_id = p.id
       JOIN users other_user ON (CASE WHEN c.buyer_id = ? THEN c.seller_id ELSE c.buyer_id END) = other_user.id
       WHERE c.buyer_id = ? OR c.seller_id = ?
       ORDER BY c.last_message_at DESC`,
      [userId, userId, userId, userId]
    );

    return successResponse(res, 'Conversations fetched successfully.', conversations);
  } catch (err) {
    next(err);
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/conversations/:id/messages
const getMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Authorization check
    const [conv] = await pool.query('SELECT buyer_id, seller_id FROM conversations WHERE id = ?', [id]);
    if (conv.length === 0) {
      return errorResponse(res, 'Conversation not found.', null, 404);
    }

    if (conv[0].buyer_id !== userId && conv[0].seller_id !== userId) {
      return errorResponse(res, 'Unauthorized access to conversation.', null, 403);
    }

    // Mark unread messages as read
    await pool.query(
      'UPDATE messages SET is_read = TRUE WHERE conversation_id = ? AND sender_id != ?',
      [id, userId]
    );

    const [messages] = await pool.query(
      `SELECT m.id, m.conversation_id, m.sender_id, m.message_text, m.is_read, m.created_at,
              u.full_name as sender_name, u.avatar_url as sender_avatar
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = ?
       ORDER BY m.id ASC`,
      [id]
    );

    return successResponse(res, 'Messages fetched successfully.', messages);
  } catch (err) {
    next(err);
  }
};

// @desc    Send message in conversation
// @route   POST /api/conversations/:id/messages
const sendMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message_text } = req.body;
    const userId = req.user.id;

    if (!message_text || message_text.trim() === '') {
      return errorResponse(res, 'Message text cannot be empty.', null, 400);
    }

    const [conv] = await pool.query(
      'SELECT c.buyer_id, c.seller_id, c.product_id, p.title FROM conversations c JOIN products p ON c.product_id = p.id WHERE c.id = ?',
      [id]
    );

    if (conv.length === 0) {
      return errorResponse(res, 'Conversation not found.', null, 404);
    }

    const conversation = conv[0];
    if (conversation.buyer_id !== userId && conversation.seller_id !== userId) {
      return errorResponse(res, 'Unauthorized access to conversation.', null, 403);
    }

    const [result] = await pool.query(
      'INSERT INTO messages (conversation_id, sender_id, message_text) VALUES (?, ?, ?)',
      [id, userId, message_text.trim()]
    );

    // Update conversation last_message_at timestamp
    await pool.query('UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);

    const recipientId = conversation.buyer_id === userId ? conversation.seller_id : conversation.buyer_id;

    // Send notification to recipient
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, 'New Chat Message', ?, 'CHAT', '/chat')`,
      [recipientId, `${req.user.full_name}: "${message_text.slice(0, 40)}${message_text.length > 40 ? '...' : ''}"`]
    );

    const newMessage = {
      id: result.insertId,
      conversation_id: parseInt(id),
      sender_id: userId,
      sender_name: req.user.full_name,
      sender_avatar: req.user.avatar_url,
      message_text: message_text.trim(),
      is_read: false,
      created_at: new Date().toISOString()
    };

    // Broadcast to WebSocket room
    const io = req.app.get('socketio');
    if (io) {
      io.to(`conversation_${id}`).emit('receive_message', newMessage);
    }

    return successResponse(res, 'Message sent successfully!', newMessage, 201);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrGetConversation,
  getUserConversations,
  getMessages,
  sendMessage
};
