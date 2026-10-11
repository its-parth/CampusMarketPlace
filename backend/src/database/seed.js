const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Parth@1234',
  multipleStatements: true
};

async function seedDatabase() {
  console.log('🌱 Starting Database Migration and Seeding...');
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL server.');

    // 1. Run Schema SQL
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await connection.query(schemaSql);
    console.log('✅ Database schema created/verified.');

    await connection.query('USE `campus_marketplace`');

    // 2. Check if users exist already
    const [existingUsers] = await connection.query('SELECT COUNT(*) as count FROM users');
    if (existingUsers[0].count > 0) {
      console.log('ℹ️ Database already seeded with users. Re-seeding clean state...');
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');
      await connection.query('TRUNCATE TABLE user_activities');
      await connection.query('TRUNCATE TABLE notifications');
      await connection.query('TRUNCATE TABLE reports');
      await connection.query('TRUNCATE TABLE reviews');
      await connection.query('TRUNCATE TABLE transactions');
      await connection.query('TRUNCATE TABLE messages');
      await connection.query('TRUNCATE TABLE conversations');
      await connection.query('TRUNCATE TABLE favorites');
      await connection.query('TRUNCATE TABLE product_images');
      await connection.query('TRUNCATE TABLE products');
      await connection.query('TRUNCATE TABLE categories');
      await connection.query('TRUNCATE TABLE users');
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    }

    // 3. Seed Users
    const defaultPasswordHash = await bcrypt.hash('Student@123456', 10);
    const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);

    const usersData = [
      ['Campus Admin', 'admin@campus.edu', adminPasswordHash, 'ADMIN', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', '555-0100', 'State University', 'ADM-8890', 'VERIFIED', null, 'Campus System Administrator', 5.0, 1],
      ['Alex Chen', 'alex.chen@student.edu', defaultPasswordHash, 'STUDENT', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80', '555-0101', 'State University (Main Campus)', 'STU-1042', 'VERIFIED', null, 'Senior CS Major. Selling textbooks, electronics, and dorm stuff!', 4.9, 12],
      ['Sarah Jenkins', 'sarah.jenkins@student.edu', defaultPasswordHash, 'STUDENT', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', '555-0102', 'State University (Engineering Campus)', 'STU-2091', 'VERIFIED', null, 'Junior Bio-Med student. Fast responses & polite trading.', 4.8, 8],
      ['Marcus Vance', 'marcus.v@student.edu', defaultPasswordHash, 'STUDENT', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', '555-0103', 'State University (North Campus)', 'STU-3301', 'VERIFIED', null, 'Sophomore Business major looking for tech & books.', 5.0, 3],
      ['Emily Rodriguez', 'emily.r@student.edu', defaultPasswordHash, 'STUDENT', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80', '555-0104', 'State University', 'STU-4912', 'PENDING', 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=400&q=80', 'Freshman student getting verified!', 0.0, 0]
    ];

    for (let u of usersData) {
      await connection.query(
        `INSERT INTO users (full_name, email, password_hash, role, avatar_url, phone, university, student_id_number, verification_status, student_card_image, bio, rating_avg, rating_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        u
      );
    }
    console.log('✅ Users seeded.');

    // 4. Seed Categories
    const categoriesData = [
      ['Textbooks & Courseware', 'textbooks', 'Textbooks, lab guides, solution manuals, and study notes.', 'BookOpen'],
      ['Electronics & Gadgets', 'electronics', 'Laptops, tablets, calculators, headphones, and chargers.', 'Laptop'],
      ['Dorm & Home Furniture', 'dorm-furniture', 'Desks, chairs, lamps, mini-fridges, and organization items.', 'Home'],
      ['Apparel & Fashion', 'apparel', 'University merch, hoodies, jackets, and shoes.', 'Shirt'],
      ['Sports & Outdoor', 'sports', 'Bicycles, gym equipment, skateboards, and sports gear.', 'Activity'],
      ['Stationery & Supplies', 'supplies', 'Notebooks, pens, art supplies, and backpacks.', 'PenTool'],
      ['Tickets & Subscriptions', 'tickets', 'Concert tickets, campus event passes, and transport vouchers.', 'Ticket'],
      ['Services & Tutoring', 'services', 'Academic tutoring, assignment proofreading, and lab prep.', 'GraduationCap'],
      ['Miscellaneous', 'miscellaneous', 'Everything else for campus life.', 'Grid']
    ];

    for (let c of categoriesData) {
      await connection.query(
        `INSERT INTO categories (name, slug, description, icon) VALUES (?, ?, ?, ?)`,
        c
      );
    }
    console.log('✅ Categories seeded.');

    // Fetch user IDs & category IDs
    const [users] = await connection.query('SELECT id, email FROM users');
    const userMap = {};
    users.forEach(u => userMap[u.email] = u.id);

    const [categories] = await connection.query('SELECT id, slug FROM categories');
    const catMap = {};
    categories.forEach(c => catMap[c.slug] = c.id);

    // 5. Seed Products & Images
    const productsData = [
      {
        seller_id: userMap['alex.chen@student.edu'],
        category_id: catMap['textbooks'],
        title: 'Calculus: Early Transcendentals 9th Ed. (Stewart)',
        description: 'Hardcover textbook used for MATH 101/102. Perfect condition with clean pages, no highlighting or pen marks. Includes digital access code scratchcard (unredeemed).',
        price: 45.00,
        original_price: 120.00,
        condition_state: 'LIKE_NEW',
        status: 'AVAILABLE',
        campus_location: 'Science Library / Main Quad',
        is_featured: true,
        images: [
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        seller_id: userMap['sarah.jenkins@student.edu'],
        category_id: catMap['electronics'],
        title: 'Apple MacBook Air M1 (2020) 256GB - Space Gray',
        description: 'Apple M1 chip with 8-core CPU and 7-core GPU, 8GB RAM, 256GB SSD. Battery health is 91%. Comes with original 30W USB-C charger and protective hard shell case.',
        price: 580.00,
        original_price: 999.00,
        condition_state: 'GOOD',
        status: 'AVAILABLE',
        campus_location: 'Student Union Hub',
        is_featured: true,
        images: [
          'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        seller_id: userMap['alex.chen@student.edu'],
        category_id: catMap['dorm-furniture'],
        title: 'Ergonomic Mesh Desk Chair for Dorm Room',
        description: 'Breathable mesh back with adjustable lumbar support and height adjustment. Great for long study sessions. Clean and fully functional.',
        price: 35.00,
        original_price: 85.00,
        condition_state: 'GOOD',
        status: 'AVAILABLE',
        campus_location: 'West Residence Hall',
        is_featured: false,
        images: [
          'https://images.unsplash.com/photo-1580481072645-022f9a6d1270?auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        seller_id: userMap['sarah.jenkins@student.edu'],
        category_id: catMap['electronics'],
        title: 'Sony WH-1000XM4 Wireless Noise Canceling Headphones',
        description: 'Industry leading active noise cancellation. Matte Black color. Battery lasts 30 hours. Includes carrying case, 3.5mm cable, and charging cable. Perfect condition.',
        price: 160.00,
        original_price: 348.00,
        condition_state: 'LIKE_NEW',
        status: 'AVAILABLE',
        campus_location: 'Engineering Library',
        is_featured: true,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        seller_id: userMap['alex.chen@student.edu'],
        category_id: catMap['textbooks'],
        title: 'Organic Chemistry Model Kit + Full Practice Problem Set',
        description: '240 piece molecular model kit for Organic Chemistry I & II. Helps visualize stereochemistry and chair conformations. Includes flashcards!',
        price: 20.00,
        original_price: 45.00,
        condition_state: 'BRAND_NEW',
        status: 'AVAILABLE',
        campus_location: 'Chemistry Building',
        is_featured: false,
        images: [
          'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        seller_id: userMap['sarah.jenkins@student.edu'],
        category_id: catMap['dorm-furniture'],
        title: 'Compact Mini Fridge with Freezer 3.2 Cu. Ft.',
        description: 'Energy-star certified compact refrigerator with top freezer unit. Super quiet motor, perfect for dorm bedrooms. Cleaned and sanitized.',
        price: 75.00,
        original_price: 160.00,
        condition_state: 'GOOD',
        status: 'AVAILABLE',
        campus_location: 'East Hall Dorms',
        is_featured: false,
        images: [
          'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        seller_id: userMap['alex.chen@student.edu'],
        category_id: catMap['electronics'],
        title: 'TI-84 Plus CE Color Graphing Calculator (Rose Gold)',
        description: 'Rechargeable battery, high-resolution full-color backlit display. Required for Statistics & Engineering math classes. Slider cover included.',
        price: 65.00,
        original_price: 130.00,
        condition_state: 'LIKE_NEW',
        status: 'AVAILABLE',
        campus_location: 'Main Quad',
        is_featured: true,
        images: [
          'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        seller_id: userMap['sarah.jenkins@student.edu'],
        category_id: catMap['apparel'],
        title: 'State University Official Varsity Fleece Jacket - Size M',
        description: 'Embroidered campus crest, heavy warm fleece interior. Brand new with tags attached. Selling because size was incorrect.',
        price: 40.00,
        original_price: 75.00,
        condition_state: 'BRAND_NEW',
        status: 'AVAILABLE',
        campus_location: 'Campus Bookstore Plaza',
        is_featured: false,
        images: [
          'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80'
        ]
      }
    ];

    for (let p of productsData) {
      const [res] = await connection.query(
        `INSERT INTO products (seller_id, category_id, title, description, price, original_price, condition_state, status, campus_location, is_featured, views_count, favorites_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.seller_id, p.category_id, p.title, p.description, p.price, p.original_price, p.condition_state, p.status, p.campus_location, p.is_featured, Math.floor(Math.random() * 40) + 10, Math.floor(Math.random() * 8)]
      );

      const productId = res.insertId;
      for (let idx = 0; idx < p.images.length; idx++) {
        await connection.query(
          `INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)`,
          [productId, p.images[idx], idx === 0]
        );
      }
    }
    console.log('✅ Products & Product Images seeded.');

    // 6. Seed Conversations & Messages
    const [p1] = await connection.query('SELECT id FROM products LIMIT 1');
    if (p1.length > 0) {
      const prodId = p1[0].id;
      const buyerId = userMap['marcus.v@student.edu'];
      const sellerId = userMap['alex.chen@student.edu'];

      const [convRes] = await connection.query(
        `INSERT INTO conversations (product_id, buyer_id, seller_id) VALUES (?, ?, ?)`,
        [prodId, buyerId, sellerId]
      );
      const convId = convRes.insertId;

      await connection.query(
        `INSERT INTO messages (conversation_id, sender_id, message_text, is_read) VALUES
         (?, ?, 'Hi Alex! Is the Calculus textbook still available for pick up at the Library?', TRUE),
         (?, ?, 'Hey Marcus! Yes, it is still available. I can meet you tomorrow around 2 PM.', TRUE),
         (?, ?, 'Perfect! 2 PM at the Science Library works great. Would you accept ₹3500 cash?', FALSE)`,
        [convId, buyerId, convId, sellerId, convId, buyerId]
      );
      console.log('✅ Conversations & Messages seeded.');
    }

    // 7. Seed Transactions & Reviews
    const [p2] = await connection.query('SELECT id FROM products ORDER BY id DESC LIMIT 1');
    if (p2.length > 0) {
      const prodId = p2[0].id;
      const buyerId = userMap['marcus.v@student.edu'];
      const sellerId = userMap['sarah.jenkins@student.edu'];

      const [txRes] = await connection.query(
        `INSERT INTO transactions (product_id, buyer_id, seller_id, agreed_price, status, meetup_location, completed_at)
         VALUES (?, ?, ?, ?, 'COMPLETED', 'Campus Bookstore Plaza', NOW())`,
        [prodId, buyerId, sellerId, 40.00]
      );
      const txId = txRes.insertId;

      await connection.query(
        `INSERT INTO reviews (transaction_id, reviewer_id, reviewee_id, rating, comment)
         VALUES (?, ?, ?, 5, 'Super smooth transaction! Sarah was on time and the jacket is in mint condition.')`,
        [txId, buyerId, sellerId]
      );
      console.log('✅ Transactions & Reviews seeded.');
    }

    // 8. Seed Reports
    await connection.query(
      `INSERT INTO reports (reporter_id, target_type, target_id, reason, description, status)
       VALUES (?, 'PRODUCT', 1, 'Inaccurate condition', 'Seller listed as brand new, but there are light pencil notes on chapter 3.', 'PENDING')`,
      [userMap['marcus.v@student.edu']]
    );
    console.log('✅ Sample Reports seeded.');

    // 9. Seed Notifications
    await connection.query(
      `INSERT INTO notifications (user_id, title, message, type, link) VALUES
       (?, 'Welcome to Campus Marketplace!', 'Your student account is fully verified. Start exploring listings now.', 'VERIFICATION', '/marketplace'),
       (?, 'New Message Received', 'Marcus sent you a message about Calculus textbook.', 'CHAT', '/chat')`,
      [userMap['alex.chen@student.edu'], userMap['alex.chen@student.edu']]
    );
    console.log('✅ Notifications seeded.');

    console.log('🎉 Database Setup & Seeding Complete Successfully!');

  } catch (error) {
    console.error('❌ Database Migration Failed:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

seedDatabase();
