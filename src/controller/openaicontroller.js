import { generateAIResponse } from "../services/openaiService.js";

export const handleAIChat = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const reply = await generateAIResponse(prompt);
    res.status(200).json({ reply });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
