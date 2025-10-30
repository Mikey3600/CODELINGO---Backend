import express from 'express';

const router = express.Router(); 

import { 
    handleAIChat, 
    handleAIGenerateQuestions 
} from '../controller/aicontroller.js';



import protect from '../middleware/authmiddleware.js'; 



router.post('/chat', handleAIChat);



router.post('/generate-questions', handleAIGenerateQuestions);


export default router;
