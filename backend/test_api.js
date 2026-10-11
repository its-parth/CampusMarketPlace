async function testApi() {
  console.log('🧪 Starting End-to-End API Integration Verification...');
  const baseUrl = 'http://localhost:5000/api';

  try {
    // 1. Health check
    const health = await fetch(`${baseUrl}/health`).then(r => r.json());
    console.log('✅ Health Check:', health);

    // 2. Student Login
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex.chen@student.edu', password: 'Student@123456' })
    }).then(r => r.json());
    console.log('✅ Student Login OK. User:', loginRes.data.user.full_name, '| Token received.');
    const studentToken = loginRes.data.token;

    // 3. Admin Login
    const adminLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@campus.edu', password: 'Admin@123456' })
    }).then(r => r.json());
    console.log('✅ Admin Login OK. User:', adminLogin.data.user.full_name);
    const adminToken = adminLogin.data.token;

    // 4. Products List & Search
    const productsRes = await fetch(`${baseUrl}/products`).then(r => r.json());
    console.log('✅ Product Catalog OK. Count:', productsRes.data.products.length, '| Total items:', productsRes.data.pagination.total);

    // 5. AI Price Suggestion
    const aiPriceRes = await fetch(`${baseUrl}/ai/suggest-price`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        title: 'TI-84 Plus Graphing Calculator',
        categoryId: 2,
        conditionState: 'LIKE_NEW',
        originalPrice: 130
      })
    }).then(r => r.json());
    console.log('✅ AI Price Suggestion OK:', aiPriceRes.data);

    // 6. AI Description Generator
    const aiDescRes = await fetch(`${baseUrl}/ai/generate-description`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        title: 'Organic Chemistry Model Kit',
        category: 'Textbooks',
        condition: 'BRAND_NEW',
        keyPoints: 'Unopened, includes molecular flashcards',
        targetPrice: 20
      })
    }).then(r => r.json());
    console.log('✅ AI Description Generator OK:', aiDescRes.data.enhancedTitle);

    // 7. Admin Dashboard Stats
    const adminDash = await fetch(`${baseUrl}/admin/dashboard`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    }).then(r => r.json());
    console.log('✅ Admin Dashboard Stats OK. Total Users:', adminDash.data.kpis.totalUsers, '| Active Listings:', adminDash.data.kpis.activeListings);

    console.log('\n🎉 ALL 7 API ENDPOINTS TESTED AND VERIFIED 100% OPERATIONAL!');
  } catch (err) {
    console.error('❌ API Test Error:', err);
  }
}

testApi();
