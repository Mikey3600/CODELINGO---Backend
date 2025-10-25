
import dsaService from '../services/dsaServices.js';

export const getDSAProblemsController = async (req, res, next) => {
    try {
        
        let problems = await dsaService.getCachedProblems();

       
        if (!problems || problems.length === 0) {
            console.log("Cache miss or expired. Initiating sync...");
            problems = await dsaService.syncAndCacheDSAProblems();
        }
        
        
        res.json(problems);
    } catch (error) {
        next(error); 
    }
};

export const refreshDSAProblemsController = async (req, res, next) => {
    try {
        
        const problems = await dsaService.syncAndCacheDSAProblems();
        
        res.json({ 
            message: 'DSA problems synced successfully with the external source.', 
            count: problems.length 
        });
    } catch (error) {
        next(error); 
    }
};