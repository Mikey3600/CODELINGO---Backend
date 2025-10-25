import challengeService from '../services/challengeService.js';




export const createChallengeController = async (req, res, next) => {
    try {
        const challengeData = req.body;
       
        if (!challengeData.title || !challengeData.type) {
             return res.status(400).json({ message: 'Challenge must have a title and type.' });
        }
        
        const newChallenge = await challengeService.createChallenge(challengeData);
        res.status(201).json(newChallenge);
    } catch (error) {
        next(error);
    }
};


export const updateChallengeController = async (req, res, next) => {
    try {
        
        return res.status(501).json({ message: 'Update Challenge not yet implemented in service.' });
    } catch (error) {
        next(error);
    }
};


export const deleteChallengeController = async (req, res, next) => {
    try {
       
        return res.status(501).json({ message: 'Delete Challenge not yet implemented in service.' });
    } catch (error) {
        next(error);
    }
};




export const getAllChallengesController = async (req, res, next) => {
    try {
        const challenges = await challengeService.getAllChallenges();
        res.json(challenges);
    } catch (error) {
        next(error);
    }
};


export const getChallengeByIdController = async (req, res, next) => {
    try {
        const challengeId = req.params.id;
        const challenge = await challengeService.getChallengeById(challengeId);
        
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }
        res.json(challenge);
    } catch (error) {
        next(error);
    }
};


export const submitChallengeResultController = async (req, res, next) => {
    try {
        const userId = req.user.id; 
        const { challengeId, score } = req.body;

        if (!challengeId || typeof score !== 'number' || score < 0 || score > 100) {
            return res.status(400).json({ message: 'Invalid challengeId or score provided.' });
        }

        const result = await challengeService.submitChallengeAttempt(userId, challengeId, score);
        
        if (result.isSuccessful) {
            res.status(200).json({ 
                message: "Challenge completed! XP earned and progress saved.", 
                ...result 
            });
        } else {
            res.status(200).json({
                message: "Challenge failed. Keep practicing!",
                ...result
            });
        }
    } catch (error) {
        next(error);
    }
};
