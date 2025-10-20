// src/controllers/userController.js
import {
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
} from '../models/userModel.js';

export const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      // exclude sensitive info like password
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserByIdController = async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      // exclude sensitive info
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserController = async (req, res) => {
  try {
    const updates = req.body;
    const updatedUser = await updateUser(req.params.id, updates);
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUserController = async (req, res) => {
  try {
    const deleted = await deleteUser(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};