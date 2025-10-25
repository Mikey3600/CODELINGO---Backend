import { Router } from 'express';
import  protect  from '../middleware/authmiddleware.js'; // <-- FIX: Changed to named import { protect }
import { 
    getUserByIdController, 
    updateUserController, 
    deleteUserController 
} from '../controller/usercontroller.js'; // NOTE: Assuming path is 'controllers' not 'controller'

const router = Router();

// Middleware to enforce that a user can only access/modify their OWN profile
const restrictToOwnUser = (req, res, next) => {
    // The 'protect' middleware should have already set req.userId
    const requestedId = req.params.id; 
    
    if (req.userId !== requestedId) {
        const error = new Error('Not authorized to access this user profile.');
        error.statusCode = 403; // Forbidden
        return next(error);
    }
    next();
};

// --- User Profile Routes ---
// All user profile actions require authentication ('protect' middleware)

// GET /api/users/:id - Get a user's profile (restricted to self)
router.get('/:id', protect, restrictToOwnUser, getUserByIdController);

// PUT /api/users/:id - Update a user's profile (restricted to self)
router.put('/:id', protect, restrictToOwnUser, updateUserController);

// DELETE /api/users/:id - Delete a user's profile (restricted to self)
router.delete('/:id', protect, restrictToOwnUser, deleteUserController);

export default router;