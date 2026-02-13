const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Use your exact database
const MONGODB_URI = 'mongodb://127.0.0.1:27017/muse-n-music';

// User Schema (exactly as in your model)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  totalSongs: { type: Number, default: 0 },
  totalPlays: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createUser() {
  try {
    // Connect to muse-n-music
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to muse-n-music database');
    
    // Check if test user already exists
    const existing = await User.findOne({ email: 'test@example.com' });
    if (existing) {
      console.log('⚠️ Test user already exists:', existing.email);
      await mongoose.disconnect();
      return;
    }
    
    // Create password hash
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Create new user
    const user = new User({
      email: 'test@example.com',
      username: 'testuser',
      password: hashedPassword,
      totalSongs: 0,
      totalPlays: 0
    });
    
    await user.save();
    console.log('✅ Test user created successfully!');
    console.log('📧 Email: test@example.com');
    console.log('👤 Username: testuser');
    console.log('🔑 Password: password123');
    
    // Verify it was saved
    const savedUser = await User.findOne({ email: 'test@example.com' });
    console.log('\n📋 Saved user:', {
      id: savedUser._id,
      email: savedUser.email,
      username: savedUser.username,
      createdAt: savedUser.createdAt
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createUser();