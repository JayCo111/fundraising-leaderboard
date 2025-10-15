/**
 * Quick API Test Script
 *
 * Usage: node test-api.js
 *
 * This script tests all major API endpoints to verify the backend is working correctly.
 */

const API_URL = 'http://localhost:3001/api/v1';

// ANSI color codes for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, url, options = {}) {
  try {
    log(`\nTesting: ${name}`, 'blue');
    log(`URL: ${url}`, 'yellow');

    const response = await fetch(url, options);
    const data = await response.json();

    if (response.ok) {
      log(`✅ SUCCESS`, 'green');
      console.log(JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      log(`❌ FAILED`, 'red');
      console.log(JSON.stringify(data, null, 2));
      return { success: false, data };
    }
  } catch (error) {
    log(`❌ ERROR: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('='.repeat(60), 'blue');
  log('🚀 Starting API Tests', 'blue');
  log('='.repeat(60), 'blue');

  // Test 1: Health Check
  await testEndpoint(
    'Health Check',
    'http://localhost:3001/health'
  );

  // Test 2: Get All Students
  await testEndpoint(
    'Get All Students',
    `${API_URL}/students`
  );

  // Test 3: Get Enriched Students
  await testEndpoint(
    'Get Enriched Students',
    `${API_URL}/students?enriched=true`
  );

  // Test 4: Get All Teams
  await testEndpoint(
    'Get All Teams',
    `${API_URL}/students/meta/teams`
  );

  // Test 5: Get All Programs
  await testEndpoint(
    'Get All Programs',
    `${API_URL}/students/meta/programs`
  );

  // Test 6: Get All Orders
  await testEndpoint(
    'Get All Orders',
    `${API_URL}/orders`
  );

  // Test 7: Get Overall Order Stats
  await testEndpoint(
    'Get Overall Order Stats',
    `${API_URL}/orders/stats/overall`
  );

  // Test 8: Get All Referrals
  await testEndpoint(
    'Get All Referrals',
    `${API_URL}/referrals`
  );

  // Test 9: Get Overall Referral Stats
  await testEndpoint(
    'Get Overall Referral Stats',
    `${API_URL}/referrals/stats/overall`
  );

  // Test 10: Get Student Leaderboard
  await testEndpoint(
    'Get Student Leaderboard',
    `${API_URL}/leaderboard/students`
  );

  // Test 11: Get Team Leaderboard
  await testEndpoint(
    'Get Team Leaderboard',
    `${API_URL}/leaderboard/teams`
  );

  // Test 12: Send Magic Link (if you have test data)
  // Uncomment and replace with a real email from your Students sheet
  /*
  await testEndpoint(
    'Send Magic Link',
    `${API_URL}/auth/magic-link`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'parent@example.com' })
    }
  );
  */

  log('\n' + '='.repeat(60), 'blue');
  log('✅ All tests completed!', 'green');
  log('='.repeat(60), 'blue');
}

// Run tests
runTests().catch(error => {
  log(`\n❌ Test suite failed: ${error.message}`, 'red');
  process.exit(1);
});
