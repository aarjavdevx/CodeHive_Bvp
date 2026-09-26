const mongoose = require("mongoose");
const dns = require("dns");
dns.setServers(["8.8.8.8"]);

const connectDB = async () => {
  console.log("1. connectDB() started");
  console.log("2. MONGO_URI exists:", !!process.env.MONGO_URI);

  try {
    console.log("3. Trying MongoDB connection...");

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("4. MongoDB connected successfully");
  } catch (error) {
    console.error("5. MongoDB connection failed:");
    console.error(error.message);
  }
};

module.exports = connectDB;