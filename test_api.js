const axios = require('axios');

async function testApi() {
  console.log('🧪 Starting End-to-End API Integration Verification...');
  const baseUrl = 'http://localhost:5000/api';

  try {
    // 1. Health check
    const health = await axios.get(`${baseUrl}/health`);
    console.log('✅ Health Check:', health.data);

    // 2. Student Login
    const loginRes = await axios.post(`${baseUrl}/auth/login`, {
      email: 'alex.chen@student.edu',
      password: 'Student@123456'
    });
    console.log('✅ Student Login OK. User:', loginRes.data.data.user.full_name, '| Token received.');
    const studentToken = loginRes.data.data.token;

    // 3. Admin Login
    const adminLogin = await axios.post(`${baseUrl}/auth/login`, {
      email: 'admin@campus.edu',
      password: 'Admin@123456'
    });
    console.log('✅ Admin Login OK. User:', adminLogin.data.data.user.full_name);
    const adminToken = adminLogin.data.data.token;

    // 4. Products List & Search
    const productsRes = await axios.get(`${baseUrl}/products`);
    console.log('✅ Product Catalog OK. Count:', productsRes.data.data.products.length, '| Total items:', productsRes.data.data.pagination.total);

    // 5. AI Price Suggestion
    const aiPriceRes = await axios.post(
      `${baseUrl}/ai/suggest-price`,
      {
        title: 'TI-84 Plus Graphing Calculator',
        categoryId: 2,
        conditionState: 'LIKE_NEW',
        originalPrice: 130
      },
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    console.log('✅ AI Price Suggestion OK:', aiPriceRes.data.data);

    // 6. AI Description Generator
    const aiDescRes = await axios.post(
      `${baseUrl}/ai/generate-description`,
      {
        title: 'Organic Chemistry Model Kit',
        category: 'Textbooks',
        condition: 'BRAND_NEW',
        keyPoints: 'Unopened, includes molecular flashcards',
        targetPrice: 20
      },
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    console.log('✅ AI Description Generator OK:', aiDescRes.data.data.enhancedTitle);

    // 7. Admin Dashboard Stats
    const adminDash = await axios.get(`${baseUrl}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin Dashboard Stats OK. Total Users:', adminDash.data.data.kpis.totalUsers, '| Active Listings:', adminDash.data.data.kpis.activeListings);

    console.log('\n🎉 ALL 7 API ENDPOINTS TESTED AND VERIFIED 100% OPERATIONAL!');
  } catch (err) {
    console.error('❌ API Test Error:', err.response?.data || err.message);
  }
}

testApi();
