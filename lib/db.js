import mongoose from 'mongoose'

let isConnected = false

export async function connectDB() {
  if (isConnected) return

  if (!process.env.MONGO_URI) {
    throw new Error("Missing MONGO_URI")
  }

  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  isConnected = conn.connections[0].readyState
}
