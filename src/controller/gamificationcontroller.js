import progressService from '../services/progressservice.js';
import profileService from '../services/profileService.js'; 

export const getUserStatsController = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        
        const stats = await profileService.getProfileByUserId(userId);
        
       
        if (!stats) {
             return res.status(404).json({ message: 'User profile not initialized.' });
        }

        res.json({
            xp: stats.xp,
            streak: stats.streak,
            username: stats.username,
        });
    } catch (error) {
        next(error); 
    }
};


export const submitLessonResultController = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { lessonId, score } = req.body; 
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        if (!lessonId || typeof score !== 'number' || score < 0 || score > 100)
            return res.status(400).json({ message: 'Invalid lessonId or score (0-100) provided.' });
        
        
        const progressRecord = await progressService.saveLessonProgress(userId, lessonId, score);

       
        const updatedStats = await profileService.getProfileByUserId(userId);
        
 
        res.json({
            message: 'Lesson progress saved and stats updated.',
            lessonProgress: {
                lessonId: progressRecord.lesson_id,
                score: progressRecord.score,
                attempts: progressRecord.attempts,
            },
            userStats: {
                xp: updatedStats.xp,
                streak: updatedStats.streak,
            }
        });

    } catch (error) {
        next(error);
    }
};


export const getLeaderboardController = async (req, res, next) => {
    try {
       
        const leaderboard = await progressService.getLeaderboard();
        res.json(leaderboard);
    } catch (error) {
        next(error);
    }
};



export default {
    getUserStatsController,
    submitLessonResultController,
    getLeaderboardController,
};

