import { Router } from 'express';
import  protect  from '../middleware/authmiddleware.js'; 
import { 
    getUserByIdController, 
    updateUserController, 
    deleteUserController 
} from '../controller/usercontroller.js'; 

const router = Router();


const restrictToOwnUser = (req, res, next) => {

    const requestedId = req.params.id; 
    
    if (req.userId !== requestedId) {
        const error = new Error('Not authorized to access this user profile.');
        error.statusCode = 403; 
        return next(error);
    }
    next();
};




router.get('/:id', protect, restrictToOwnUser, getUserByIdController);

router.put('/:id', protect, restrictToOwnUser, updateUserController);


router.delete('/:id', protect, restrictToOwnUser, deleteUserController);

export default router;