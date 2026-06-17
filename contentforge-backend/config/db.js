// backend/config/db.js
const mongoose = require('mongoose')
require('dotenv').config()

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`)
    console.error('👉 Check your MONGO_URI in the .env file')
    process.exit(1)
  }
}

module.exports = connectDB
