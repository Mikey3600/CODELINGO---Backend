
import express from 'express';
import { getUserById, updateUser, deleteUser } from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Authorization header missing' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// Get user profile by ID (authenticated)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.userId !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user.id, email: user.email, username: user.username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile (authenticated)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.userId !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const updates = req.body;
    if (updates.password) {
      updates.hashed_password = await bcrypt.hash(updates.password, 10);
      delete updates.password;
    }
    const updatedUser = await updateUser(req.params.id, updates);
    res.json({ id: updatedUser.id, email: updatedUser.email, username: updatedUser.username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user account (authenticated)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.userId !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    await deleteUser(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;