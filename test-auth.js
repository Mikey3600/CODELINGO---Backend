const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = "http://localhost:5000/api";

async function testAuth() {
  console.log("\n🧪 Testing Auth System\n");

  try {
    // Test 1: Health Check
    console.log("1️⃣  Health Check:");
    const healthRes = await fetch(`${BASE_URL}/health`);
    const health = await healthRes.json();
    console.log(`   ✅ Status: ${health.status}`);
    console.log(`   ⏰ Time: ${health.time}\n`);

    // Test 2: Register
    console.log("2️⃣  Register New User:");
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User " + Date.now(),
        email: `test${Date.now()}@example.com`,
        password: "SecurePassword123",
      }),
    });
    const regData = await regRes.json();
    if (regRes.ok) {
      console.log(`   ✅ Status: ${regRes.status}`);
      console.log(`   👤 User: ${regData.data.user.name}`);
      console.log(`   📧 Email: ${regData.data.user.email}`);
      console.log(`   🔐 Token: ${regData.data.token.substring(0, 30)}...\n`);

      const token = regData.data.token;
      const email = regData.data.user.email;

      // Test 3: Login
      console.log("3️⃣  Login:");
      const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          password: "SecurePassword123",
        }),
      });
      const loginData = await loginRes.json();
      if (loginRes.ok) {
        console.log(`   ✅ Status: ${loginRes.status}`);
        console.log(`   👤 User: ${loginData.data.user.name}\n`);
      } else {
        console.log(`   ❌ Error: ${loginData.error}\n`);
      }

      // Test 4: Get Me (Protected)
      console.log("4️⃣  Get Current User (Protected):");
      const meRes = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const meData = await meRes.json();
      if (meRes.ok) {
        console.log(`   ✅ Status: ${meRes.status}`);
        console.log(`   👤 Name: ${meData.data.user.name}`);
        console.log(`   📧 Email: ${meData.data.user.email}`);
        console.log(`   ⭐ XP: ${meData.data.user.totalXP}\n`);
      } else {
        console.log(`   ❌ Error: ${meData.error}\n`);
      }

      // Test 5: Invalid Password
      console.log("5️⃣  Login with Wrong Password:");
      const wrongRes = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          password: "WrongPassword123",
        }),
      });
      const wrongData = await wrongRes.json();
      console.log(`   ✅ Status: ${wrongRes.status}`);
      console.log(`   📝 Error: ${wrongData.error}\n`);

      // Test 6: Get Courses
      console.log("6️⃣  Get All Courses:");
      const coursesRes = await fetch(`${BASE_URL}/courses`);
      const coursesData = await coursesRes.json();
      console.log(`   ✅ Status: ${coursesRes.status}`);
      console.log(`   📚 Total Courses: ${coursesData.data.courses?.length || 0}\n`);
    } else {
      console.log(`   ❌ Error: ${regData.error}`);
      console.log(`   📝 Details:`, regData.details);
    }

    console.log("✅ All tests completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testAuth();
