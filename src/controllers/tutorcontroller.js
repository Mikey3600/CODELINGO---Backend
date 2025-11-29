

import Groq from "groq-sdk";
import fs from "fs";
import dotenv from "dotenv";
import { asyncHandler } from "../middleware/asyncHandler.js";

dotenv.config(); 


const client = new Groq({
  apiKey: process.env.GROQ_API_KEY, 
});


function cleanResponse(text) {
  if (!text) return "No response received.";
  return text.trim();
}

// -------------------------------------------------------------
// ASK THE AI TUTOR (POST /api/tutor/ask)
// -------------------------------------------------------------
export const askTutor = asyncHandler(async (req, res) => {
  const { question, language = "python", level = "beginner", code } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  let fileContent = "";
  if (req.file) {
    fileContent = fs.readFileSync(req.file.path, "utf8");
  }

  const prompt = `
You are an expert AI tutor.

USER QUESTION:
${question}

LANGUAGE: ${language}
LEVEL: ${level}

${code ? "USER CODE:\n" + code : ""}
${fileContent ? "FILE CONTENT:\n" + fileContent : ""}

TUTOR RULES:
- Do NOT give final answer first.
- Give hints.
- Explain step-by-step.
- Give dry-run examples.
- Only provide full solution when asked.
`;

  const completion = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.5,
    messages: [{ role: "user", content: prompt }],
  });

  const reply = cleanResponse(completion.choices[0].message.content);

  res.status(200).json({ response: reply });
});

export const revealSolution = asyncHandler(async (req, res) => {
  const { question, language = "python" } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  const prompt = `
The user clicked "I can't do it".
Provide FULL final solution in ${language}.

QUESTION:
${question}
`;

  const completion = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.4,
    messages: [{ role: "user", content: prompt }],
  });

  const reply = cleanResponse(completion.choices[0].message.content);

  res.status(200).json({ solution: reply });
});
