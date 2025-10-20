
import express from 'express';
import { getAiResponse } from '../services/openaiservices.js';

const router = express.Router();

// Endpoint to send a query to AI mentor and get response
router.post('/query', async (req, res) => {
  try {
    const { prompt, context } = req.body;
    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }
    const response = await getAiResponse(prompt, context);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;