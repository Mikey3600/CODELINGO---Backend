import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


export async function getAiResponse(prompt, context = "") {
  try {
   
    const fullPrompt = context
      ? `${context}\n\nUser Question: ${prompt}`
      : prompt;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      messages: [{ role: "user", content: fullPrompt }],
    });

    
    return response.choices[0].message.content;
  } catch (error) {
    console.error(" OpenAI API Error:", error);
    throw new Error("Failed to generate AI response");
  }
}

