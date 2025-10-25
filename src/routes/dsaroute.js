/**
 * @file: src/routes/dsaroute.js
 * @description: Routes for Data Structures and Algorithms (DSA) content.
 * All routes use a Named Export pattern: 'export const router'.
 */

import express from 'express';
// import { protect } from '../middleware/authmiddleware.js'; 
// import * as dsaController from '../controller/dsaController.js'; 

// CRITICAL: Use 'export const router' to create a NAMED EXPORT
export const router = express.Router();

// --- Mock Controller Functions (To be replaced by actual dsaController imports) ---
const mockControllers = {
    /** GET /api/dsa/topics */
    getAllTopics: (req, res) => {
        // In a real application, this would call dsaController.getAllTopics
        res.status(200).json({ 
            status: 'success',
            message: "Successfully retrieved primary DSA topics.",
            data: ["Arrays & Hashing", "Two Pointers", "Trees & Graphs", "Dynamic Programming", "Sorting & Searching"]
        });
    },

    /** GET /api/dsa/problems/:topic */
    getProblemsByTopic: (req, res) => {
        const { topic } = req.params;
        // In a real application, this would call dsaController.getProblemsByTopic
        res.status(200).json({ 
            status: 'success',
            message: `Problems found for topic: ${topic}`,
            data: [
                { id: 't1', title: 'Two Sum', difficulty: 'Easy' },
                { id: 't2', title: 'Container With Most Water', difficulty: 'Medium' }
            ]
        });
    },

    /** POST /api/dsa/submit/:problemId */
    submitSolution: (req, res) => {
        // This route should ideally be protected by 'protect' middleware
        res.status(200).json({ 
            status: 'success',
            message: "Solution submission received.",
            result: 'Pending execution and scoring.'
        });
    }
};

// ----------------------------------------------------------------------
// DSA Route Definitions
// ----------------------------------------------------------------------

// GET /api/dsa/topics - Get all available DSA topic categories
router.get('/topics', mockControllers.getAllTopics);

// GET /api/dsa/problems/:topic - Get problems within a specific topic
router.get('/problems/:topic', mockControllers.getProblemsByTopic);

// POST /api/dsa/submit/:problemId - Submit a solution for a problem 
// router.post('/submit/:problemId', protect, mockControllers.submitSolution); 
router.post('/submit/:problemId', mockControllers.submitSolution);

export default router;