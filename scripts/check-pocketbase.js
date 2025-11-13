#!/usr/bin/env node

const POCKETBASE_URL = process.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';

async function checkPocketBase() {
  console.log('Checking PocketBase connection...');
  console.log(`URL: ${POCKETBASE_URL}`);
  
  try {
    const response = await fetch(`${POCKETBASE_URL}/api/health`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ PocketBase is running!');
      console.log(`Status: ${data.message}`);
      console.log(`Code: ${data.code}`);
      return true;
    } else {
      console.error('❌ PocketBase is not responding correctly');
      console.error(`Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Cannot connect to PocketBase');
    console.error(`Error: ${error.message}`);
    console.log('\nMake sure PocketBase is running:');
    console.log('  ./pocketbase serve');
    console.log('\nOr download it from: https://pocketbase.io/docs/');
    return false;
  }
}

checkPocketBase().then(success => {
  process.exit(success ? 0 : 1);
});
