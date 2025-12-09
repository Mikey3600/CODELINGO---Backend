import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function register(req) {
  const { username, email, password } = req.body

  const userExists = await User.findOne({ $or: [{ email }, { username }] })
  if (userExists) return { status: 400, body: { message: 'EXISTS' } }

  const hashed = await bcrypt.hash(password, 10)

  const user = await User.create({
    username,
    email,
    password: hashed
  })

  return { status: 200, body: { message: 'REGISTERED', user: user._id } }
}

export async function login(req) {
  const { username, password } = req.body

  const user = await User.findOne({ username })
  if (!user) return { status: 400, body: { message: 'NOUSER' } }

  const match = await bcrypt.compare(password, user.password)
  if (!match) return { status: 400, body: { message: 'WRONG' } }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

  return { status: 200, body: { message: 'LOGGED', token } }
}

