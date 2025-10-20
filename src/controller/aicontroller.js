import {
  createAIInteraction,
  getAIInteractionsByUser,
  getAIInteractionById,
  updateAIInteraction,
  deleteAIInteraction,
} from '../models/aiInteractionModel.js';
import OpenAI from "openai"; // or whichever AI SDK you're using

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 💬 Actual AI Chat Handler
export const handleAIChat = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: "Prompt is required" });

    // Call OpenAI or any AI model
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // or any model you use
      messages: [{ role: "user", content: prompt }],
    });

    const aiResponse = completion.choices[0].message.content;

    // Optionally store it in your DB (using your existing createAIInteraction)
    const savedInteraction = await createAIInteraction({
      userId: req.user?.id || "anonymous",
      prompt,
      response: aiResponse,
      metadata: { source: "AIChat" },
      createdAt: new Date().toISOString(),
    });

    res.status(200).json({ message: "Success", data: savedInteraction });
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// 📜 Get all AI interactions for logged-in user
export const getUserAIInteractionsController = async (req, res) => {
  try {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit) || 50;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const interactions = await getAIInteractionsByUser(userId, limit);
    res.json(interactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔍 Get a single AI interaction by ID
export const getAIInteractionByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const interaction = await getAIInteractionById(id);
    if (!interaction) return res.status(404).json({ message: 'Interaction not found' });
    res.json(interaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✏️ Update an AI interaction
export const updateAIInteractionController = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedInteraction = await updateAIInteraction(id, updates);
    if (!updatedInteraction)
      return res.status(404).json({ message: 'Interaction not found' });

    res.json(updatedInteraction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ❌ Delete an AI interaction
export const deleteAIInteractionController = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedInteraction = await deleteAIInteraction(id);
    if (!deletedInteraction)
      return res.status(404).json({ message: 'Interaction not found' });

    res.json({ message: 'Interaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
