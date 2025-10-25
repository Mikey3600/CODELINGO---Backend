
import express from 'express';

import { 
    getUserStatsController, 
    submitLessonResultController, 
    getLeaderboardController 
} from '../controller/gamificationcontroller.js';

import  protect  from '../middleware/authmiddleware.js'; 

const router = express.Router();


router.get('/leaderboard', getLeaderboardController);


router.get('/stats', protect, getUserStatsController);


router.post('/submit-lesson', protect, submitLessonResultController);



export default router;