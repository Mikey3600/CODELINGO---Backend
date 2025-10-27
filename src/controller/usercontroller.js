
import * as profileService from '../services/profileService.js';
import AppError from '../utils/apperror.js';


export const getUserByIdController = async (req, res, next) => {
    try {
        const requestedId = req.params.id;

        const userProfile = await profileService.getUserProfile(requestedId);

       
        res.json({
            status: 'success',
            data: userProfile
        });
    } catch (error) {
        next(error);
    }
};

export const updateUserController = async (req, res, next) => {
    try {
        const requestedId = req.params.id;
        const updates = req.body;

       
        const updatedUser = await profileService.updateUserProfile(requestedId, updates);

       
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


export const deleteUserController = async (req, res, next) => {
    try {
        const requestedId = req.params.id;

       
        await profileService.deleteUser(requestedId);

        res.status(204).json({
            status: 'success',
            message: 'User account and profile successfully deleted.'
        });
    } catch (error) {
        next(error);
    }
};


export const getAllUsersController = async (req, res, next) => {
    try {
        
        const users = await profileService.getAllUserProfiles();


        const safeUsers = users.map(user => ({
            id: user.user_id,
            username: user.username,
            name: user.name,
            xp: user.xp || 0, 
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
