

import express from 'express';

export const router = express.Router();


const mockControllers = {
   
    getAllTopics: (req, res) => {
        
        res.status(200).json({ 
            status: 'success',
            message: "Successfully retrieved primary DSA topics.",
            data: ["Arrays & Hashing", "Two Pointers", "Trees & Graphs", "Dynamic Programming", "Sorting & Searching"]
        });
    },


    getProblemsByTopic: (req, res) => {
        const { topic } = req.params;
        
        res.status(200).json({ 
            status: 'success',
            message: `Problems found for topic: ${topic}`,
            data: [
                { id: 't1', title: 'Two Sum', difficulty: 'Easy' },
                { id: 't2', title: 'Container With Most Water', difficulty: 'Medium' }
            ]
        });
    },

    
    submitSolution: (req, res) => {
        
        res.status(200).json({ 
            status: 'success',
            message: "Solution submission received.",
            result: 'Pending execution and scoring.'
        });
    }
};




router.get('/topics', mockControllers.getAllTopics);


router.get('/problems/:topic', mockControllers.getProblemsByTopic);

; 
router.post('/submit/:problemId', mockControllers.submitSolution);

export default router;