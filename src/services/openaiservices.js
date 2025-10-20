import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// The function name must match what your route imports: getAiResponse()
export async function getAiResponse(prompt, context = "") {
  try {
    // Combine context + prompt for better AI understanding
    const fullPrompt = context
      ? `${context}\n\nUser Question: ${prompt}`
      : prompt;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // You can also use "gpt-4o" if available
      messages: [{ role: "user", content: fullPrompt }],
    });

    // Return the AI-generated text
    return response.choices[0].message.content;
  } catch (error) {
    console.error("❌ OpenAI API Error:", error);
    throw new Error("Failed to generate AI response");
  }
}

