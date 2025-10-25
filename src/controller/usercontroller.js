/**
 * @file: src/controllers/usercontroller.js
 * @description: Controller for managing user profiles (fetching, updating, deleting).
 * This controller uses the 'profileService' to securely interact with Supabase tables.
 */
import * as profileService from '../services/profileService.js';
import AppError from '../utils/apperror.js';

/**
 * @function getUserByIdController
 * @description Retrieves a single user's profile data.
 * NOTE: Access is restricted to the owner by the 'restrictToOwnUser' middleware in the router.
 */
export const getUserByIdController = async (req, res, next) => {
    try {
        const requestedId = req.params.id;

        // The check (userId !== requestedId) is now handled by the router middleware, 
        // so we can proceed directly to fetching the profile.
        const userProfile = await profileService.getUserProfile(requestedId);

        // Filter out sensitive data (like role, if present) before sending
        res.json({
            status: 'success',
            data: userProfile
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @function updateUserController
 * @description Updates a user's profile information (username, name, etc.).
 * NOTE: Access is restricted to the owner by the 'restrictToOwnUser' middleware in the router.
 */
export const updateUserController = async (req, res, next) => {
    try {
        const requestedId = req.params.id;
        const updates = req.body;

        // The check (userId !== requestedId) is handled by the router middleware.

        // The service layer handles password hashing if 'password' is present
        const updatedUser = await profileService.updateUserProfile(requestedId, updates);

        // Filter out sensitive data
        const safeData = {
            id: updatedUser.user_id,
            email: updatedUser.email,
            username: updatedUser.username,
            name: updatedUser.name,
        };

        res.json({
            status: 'success',
            data: safeData
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @function deleteUserController
 * @description Deletes a user's account. This should be handled with extreme caution.
 * NOTE: Access is restricted to the owner by the 'restrictToOwnUser' middleware in the router.
 */
export const deleteUserController = async (req, res, next) => {
    try {
        const requestedId = req.params.id;

        // The check (userId !== requestedId) is handled by the router middleware.

        // The service layer handles both Auth and Profile deletion.
        await profileService.deleteUser(requestedId);

        res.status(204).json({
            status: 'success',
            message: 'User account and profile successfully deleted.'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @function getAllUsersController
 * @description Retrieves a list of all users. Typically restricted to admin or for leaderboard.
 */
export const getAllUsersController = async (req, res, next) => {
    try {
        // Assume admin check is done in a previous middleware or route definition.

        const users = await profileService.getAllUserProfiles();

        // Map and filter data for public view (e.g., for a leaderboard)
        const safeUsers = users.map(user => ({
            id: user.user_id,
            username: user.username,
            name: user.name,
            xp: user.xp || 0, // Include gamification data if available
        }));

        res.json({
            status: 'success',
            results: safeUsers.length,
            data: {
                users: safeUsers,
            },
        });
    } catch (error) {
        next(error);
    }
};
