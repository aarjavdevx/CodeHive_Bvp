import mongoose from 'mongoose';
import dns from 'dns';

const connectDB = async () => {
  console.log('1. connectDB() started');
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/codehive';
  console.log('2. MONGO_URI configured:', !!process.env.MONGO_URI, '(using ' + (process.env.MONGO_URI ? 'custom URI' : 'local fallback: 127.0.0.1:27017/codehive') + ')');

  if (uri.startsWith('mongodb+srv:')) {
    try {
      dns.setServers(['8.8.8.8', '8.8.4.4']);
    } catch (e) {
      console.warn('DNS server setting notice:', e.message);
    }
  }

  try {
    console.log('3. Trying MongoDB connection...');
    const maskedUri = uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log(`   Connecting to: ${maskedUri}`);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log('4. ✅ MongoDB connected successfully');
  } catch (error) {
    console.error('5. ❌ MongoDB connection failed:');
    console.error(error.message);
  }
};

export default connectDB;