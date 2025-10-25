
import adaptiveTestService from '../services/getadaptiveservices.js';

export const createAdaptiveTestController = async (req, res, next) => {
    try {
        const userId = req.user.id; 
        const { testData, currentLevel, score, startedAt, finishedAt } = req.body;

        const newTest = await adaptiveTestService.createAdaptiveTest({
            userId,
            testData,
            currentLevel,
            score: score || 0,
            startedAt: startedAt || new Date().toISOString(),
            finishedAt: finishedAt || null,
        });

        res.status(201).json(newTest);
    } catch (error) {
        next(error);
    }
};

export const getAdaptiveTestByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const test = await adaptiveTestService.getAdaptiveTestById(id);

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }
        
        res.json(test);
    } catch (error) {
        next(error);
    }
};

export const getUserAdaptiveTestsController = async (req, res, next) => {
    try {
        const userId = req.user.id; 

        const tests = await adaptiveTestService.getAdaptiveTestsByUser(userId);
        res.json(tests);
    } catch (error) {
        next(error);
    }
};

export const updateAdaptiveTestController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        
        const updatedTest = await adaptiveTestService.updateAdaptiveTest(id, updates);
        
        if (!updatedTest) {
            return res.status(404).json({ message: 'Test not found or no changes made' });
        }
        res.json(updatedTest);
    } catch (error) {
        next(error);
    }
};

export const deleteAdaptiveTestController = async (req, res, next) => {
    try {
        const { id } = req.params;
        
       

        const deleted = await adaptiveTestService.deleteAdaptiveTest(id);
        
        if (!deleted) {
           
            return res.status(404).json({ message: 'Test not found for deletion' });
        }
        res.json({ message: 'Test deleted successfully' });
    } catch (error) {
        next(error);
    }
};
