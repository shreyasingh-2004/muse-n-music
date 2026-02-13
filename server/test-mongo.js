// test-connection.js
const mongoose = require('mongoose');
require('dotenv').config();

async function test() {
  console.log('=== Testing Muse-N-Music Database Connection ===');
  console.log('URI:', process.env.MONGODB_URI ? 'Found (hidden)' : 'Missing');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });
    
    console.log('✅ SUCCESS: Connected to MongoDB Atlas');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    console.log(`🔗 Host: ${mongoose.connection.host}`);
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📁 Collections:');
    if (collections.length > 0) {
      collections.forEach(coll => console.log(`   - ${coll.name}`));
    } else {
      console.log('   No collections yet. They will be created automatically.');
    }
    
    await mongoose.disconnect();
    console.log('\n🎉 Ready to use! Start your server with: npm run dev');
    
  } catch (error) {
    console.error('\n❌ FAILED:', error.message);
    
    if (error.message.includes('bad auth')) {
      console.log('\n💡 Password might be wrong. Check your credentials.');
    } else if (error.message.includes('querySrv')) {
      console.log('\n💡 DNS issue. Try:');
      console.log('1. Use non-SRV: replace "mongodb+srv://" with "mongodb://"');
      console.log('2. Add port: ":27017" after hostname');
    } else if (error.message.includes('network')) {
      console.log('\n💡 Network access issue. Go to MongoDB Atlas → Network Access → Add IP (0.0.0.0/0)');
    }
  }
}

test();