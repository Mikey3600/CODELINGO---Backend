const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.register = async (req, res) => {
  const { username, email, password } = req.body
  const userExists = await User.findOne({ $or: [{ email }, { username }] })
  if (userExists) return res.status(400).json({ message: 'EXISTS' })
  const hashed = await bcrypt.hash(password, 10)
  const user = await User.create({ username, email, password: hashed })
  res.json({ message: 'REGISTERED', user: user._id })
}

exports.login = async (req, res) => {
  const { username, password } = req.body
  const user = await User.findOne({ username })
  if (!user) return res.status(400).json({ message: 'NOUSER' })
  const match = await bcrypt.compare(password, user.password)
  if (!match) return res.status(400).json({ message: 'WRONG' })
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
  res.json({ message: 'LOGGED', token })
}
