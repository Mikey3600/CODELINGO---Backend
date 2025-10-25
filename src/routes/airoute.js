import express from 'express';
// CRITICAL FIX: The router object must be initialized before use.
const router = express.Router(); 

import { 
    handleAIChat, 
    handleAIGenerateQuestions 
} from '../controller/aicontroller.js';

// FIX: Importing the DEFAULT export and naming it 'protect'.
import protect from '../middleware/authmiddleware.js'; 


router.post('/chat', protect, handleAIChat);


router.post('/generate-questions', protect, handleAIGenerateQuestions);


export default router;
