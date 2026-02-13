// Run this in browser console to test CORS
const testCORS = async () => {
  try {
    const response = await fetch('http://localhost:5000/health');
    const data = await response.json();
    console.log('✅ CORS Test Successful:', data);
  } catch (error) {
    console.error('❌ CORS Test Failed:', error);
  }
};

// Copy and paste this in browser console to test
testCORS();