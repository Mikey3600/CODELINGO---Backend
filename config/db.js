const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...")
    console.log("URI:", process.env.MONGO_URI)

    const conn = await mongoose.connect(process.env.MONGO_URI)

    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (err) {
    console.error("MongoDB ERROR:", err)
    process.exit(1)
  }
}

module.exports = connectDB

