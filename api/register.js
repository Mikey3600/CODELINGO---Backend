import { connectDB } from '../lib/db.js'
import { register } from '../controllers/authController.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  await connectDB()

  const result = await register(req)
  return res.status(result.status).json(result.body)
}
