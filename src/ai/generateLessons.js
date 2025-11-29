

import dotenv from "dotenv";
import Groq from "groq-sdk";
import connectDB from "../config/db.js";
import Language from "../models/Language.js";
import Lesson from "../models/Lesson.js";

dotenv.config();


const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});


const LANGUAGES = [
  { name: "Python", code: "python", emoji: "🐍" },
  { name: "C", code: "c", emoji: "💡" },
  { name: "C++", code: "cpp", emoji: "🚀" },
  { name: "Java", code: "java", emoji: "☕" },
  { name: "JavaScript", code: "javascript", emoji: "✨" },
];


function buildPrompt(language, lessonNumber) {
  return `
Generate a complete programming lesson for language: ${language}.
Lesson number: ${lessonNumber}

OUTPUT STRICTLY IN VALID JSON ONLY. NO EXPLANATION, NO MARKDOWN.

Use exactly this structure:

{
  "title": "",
  "description": "",
  "difficulty": "beginner | intermediate | advanced",
  "questions": [
    {
      "type": "mcq",
      "question": "",
      "options": ["", "", "", ""],
      "correctAnswer": ""
    },
    {
      "type": "code",
      "question": "",
      "initialCode": "",
      "solution": ""
    },
    {
      "type": "debug",
      "question": "",
      "buggyCode": "",
      "fix": ""
    },
    {
      "type": "output",
      "question": "",
      "code": "",
      "answer": ""
    }
  ]
}

Rules:
- 8–12 TOTAL questions in the "questions" array.
- Mix mcq, code, debug, and output types.
- Use real concepts for ${language}, progressing in difficulty.
- DO NOT add comments or text outside the JSON.
- DO NOT wrap the JSON in backticks.
`;
}


async function tryFixJSON(rawText) {
  try {
    const fix = await groq.chat.completions.create({
      model: "llama-3.3-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a JSON repair bot. Return ONLY valid JSON, no explanation.",
        },
        {
          role: "user",
          content: rawText,
        },
      ],
      temperature: 0,
    });

    const fixed = fix.choices[0]?.message?.content?.trim() || "{}";
    return JSON.parse(fixed);
  } catch (e) {
    return null;
  }
}
async function generateAllLessons() {
  await connectDB();
  console.log("🔥 Connected to DB. Starting lesson generation...");

  
  const languageDocs = {};
  for (const lang of LANGUAGES) {
    let doc = await Language.findOne({ code: lang.code });
    if (!doc) {
      doc = await Language.create(lang);
    }
    languageDocs[lang.code] = doc;
  }

  for (let lessonNo = 1; lessonNo <= 100; lessonNo++) {
    console.log(`\n🔵 ROUND ${lessonNo}/100 — one lesson per language\n`);

    for (const lang of LANGUAGES) {
      console.log(`📘 ${lang.name} — Lesson ${lessonNo}/100`);

      let success = false;
      let attempts = 0;

      while (!success && attempts < 3) {
        attempts++;

        try {
          const prompt = buildPrompt(lang.name, lessonNo);

          const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content:
                  "You generate strictly valid JSON lessons. No extra text.",
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.6,
          });

          const raw = completion.choices[0]?.message?.content?.trim() || "{}";

          let data;
          try {
            data = JSON.parse(raw);
          } catch {
            console.log(" JSON invalid — trying to fix...");
            data = await tryFixJSON(raw);
            if (!data) {
              console.log(" Unable to fix JSON, will retry this lesson...");
              continue;
            }
          }

          
          const title =
            data.title ||
            `Lesson ${lessonNo} - ${lang.name} fundamentals (${Date.now()})`;
          const description = data.description || "";
          const difficulty = data.difficulty || "beginner";
          const questions = Array.isArray(data.questions)
            ? data.questions
            : [];

          await Lesson.create({
            language: languageDocs[lang.code]._id,
            title,
            description,
            difficulty,
            questions,
          });

          console.log(` Saved Lesson ${lessonNo} for ${lang.name}`);
          success = true;
        } catch (err) {
          console.log(
            ` Error for ${lang.name} Lesson ${lessonNo} (attempt ${attempts}):`,
            err.message
          );
        }
      }

      if (!success) {
        console.log(
          ` Skipping ${lang.name} Lesson ${lessonNo} after 3 failed attempts.`
        );
      }
    }
  }

  console.log("\n FINISHED generating lessons for all languages!");
  process.exit(0);
}

generateAllLessons();


