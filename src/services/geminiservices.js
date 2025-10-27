import { serverSupabase } from "../utils/supabaseClient.js"; 
import logger from '../utils/logger.js';
import AppError from '../utils/apperror.js'; 


const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent";


const SYSTEM_INSTRUCTION = "You are an expert CodeLingo study assistant. Provide concise, encouraging, and accurate coding tips based on the user's activity.";


export async function getGeminiResponse(userPrompt, responseSchema = null, history = []) {
    if (!process.env.GEMINI_API_KEY) {
        logger.error('GEMINI_API_KEY is not set.');
        throw new AppError('Gemini service misconfigured (Missing API Key).', 500);
    }
    
    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `${GEMINI_API_URL}?key=${apiKey}`;
    let lastError = null;

    
    const contents = [...history, { role: "user", parts: [{ text: userPrompt }] }];

    const payload = {
        contents: contents,
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
       
        ...(responseSchema && {
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        })
    };

    for (let i = 0; i < 3; i++) { // Retry loop with exponential backoff
        try {
            const response = await axios.post(apiUrl, payload, {
                headers: { 'Content-Type': 'application/json' },
                // Allow Axios to handle 4xx status codes so we can process them
                validateStatus: (status) => status >= 200 && status < 500
            });
            
            // --- Rate Limiting / API Error Check ---
            if (response.status === 429 && i < 2) {
                 const delay = Math.pow(2, i) * 1000;
                 logger.warn(`Gemini API rate limit hit (Status 429). Retrying in ${delay / 1000}ms...`);
                 await new Promise(resolve => setTimeout(resolve, delay));
                 continue; 
            }
            if (response.status >= 400) {
                 throw new AppError(`Gemini API request failed with status ${response.status}.`, response.status);
            }

            // --- Successful Response Processing ---
            const candidate = response.data.candidates?.[0];

            if (candidate && candidate.content?.parts?.[0]?.text) {
                const text = candidate.content.parts[0].text;
                
                // Check if structured JSON was requested and attempt to parse
                if (responseSchema) {
                    try {
                        return JSON.parse(text);
                    } catch (e) {
                        logger.error('Failed to parse Gemini JSON response.', { rawText: text, error: e.message });
                        throw new AppError('AI returned invalid JSON structure.', 500);
                    }
                }
                return text; // Return plain text
            }

            logger.warn('Gemini response was empty or malformed.', { data: response.data });
            lastError = new AppError("AI returned empty or malformed content.", 500);
            throw lastError; // Throw to trigger retry or final error

        } catch (error) {
            // Re-throw if it's already an AppError (e.g., failed JSON parsing or 4xx status)
            if (error instanceof AppError) throw error; 
            
            // Handle network/timeout errors
            lastError = new AppError(`Network or unexpected error during Gemini API call: ${error.message}`, 500);

            if (i === 2) throw lastError; // Throw on final attempt

            const delay = Math.pow(2, i) * 1000;
            logger.error(`Gemini API attempt failed. Retrying in ${delay / 1000}ms. Error: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw lastError; // Should not be reached, but necessary for function completeness
}


/**
 * @function generateAdaptiveTest
 * @description Generates a structured adaptive test based on user skill level and language.
 * This function is exported to satisfy the dependency in the adaptiveTestroute.
 * @param {string} language - The programming language (e.g., 'Python', 'C++').
 * @param {string} skillLevel - The user's current skill level (e.g., 'Beginner', 'Intermediate').
 * @param {number} numQuestions - The desired number of questions.
 * @returns {Promise<Object[]>} A list of question objects.
 */
export async function generateAdaptiveTest(language, skillLevel, numQuestions = 5) {
    // Schema must match the expected output of the controller/route (see testController.js)
    const responseSchema = {
        type: "ARRAY",
        items: {
            type: "OBJECT",
            properties: {
                "question_id": { "type": "STRING", "description": "Unique UUID for this question." },
                "type": { "type": "STRING", "enum": ["mcq", "fill_in_the_blank", "code_snippet_bug"] },
                "language": { "type": "STRING" },
                "prompt": { "type": "STRING", "description": "The question text or scenario." },
                "options": { "type": "ARRAY", "items": { "type": "STRING" }, "description": "List of choices for MCQ (empty for others)." },
                "correct_answer": { "type": "STRING", "description": "The correct choice letter (A/B/C/D) or the correct code/value." },
                "difficulty_level": { "type": "STRING", "enum": ["easy", "medium", "hard"] },
                "topic": { "type": "STRING", "description": "e.g., 'Loops', 'Polymorphism', 'Time Complexity'" }
            },
            required: ["question_id", "type", "language", "prompt", "correct_answer", "difficulty_level"]
        }
    };

    const userPrompt = `Generate a quiz with ${numQuestions} questions in ${language} for a ${skillLevel} level user. Ensure a mix of multiple-choice and code-snippet questions, strictly matching the JSON schema.`;
    
    try {
        const questions = await getGeminiResponse(userPrompt, responseSchema);
        if (Array.isArray(questions)) return questions;
        throw new AppError("AI did not return a valid array of questions.", 500);
    } catch (error) {
        logger.error(`Error generating adaptive test: ${error.message}`);
        throw error;
    }
}


/**
 * @function generateMentorResponse
 * @description Generates a personalized mentor response for a specific coding question or lesson.
 * @param {Array<Object>} history - The chat history or context.
 * @param {string} userQuery - The user's latest question.
 * @returns {Promise<string>} The mentor's response text.
 */
export async function generateMentorResponse(history, userQuery) {
    // The role of 'CodeLingo Mentor' is guided by the system instruction and prompt context
    const mentorUserPrompt = `Act as 'CodeLingo Mentor.' Provide a patient and encouraging response to this user query: ${userQuery}`;

    try {
        const responseText = await getGeminiResponse(mentorUserPrompt, null, history);
        return responseText;
    } catch (error) {
        logger.error(`Error generating mentor response: ${error.message}`);
        throw error;
    }
}

/**
 * @function getDailyCodingTip
 * @description Fetches a quick, random coding tip for the dashboard.
 * @returns {Promise<string>} A concise coding tip.
 */
export async function getDailyCodingTip(language = 'JavaScript') {
    const prompt = `Generate a single, concise, and helpful coding tip (max 2 sentences) focused on a common pitfall or best practice in ${language}. Do not include a title or sign-off.`;
    
    try {
        // Use the core service function, no schema needed for plain text response
        const tip = await getGeminiResponse(prompt);
        return tip.trim();
    } catch (e) {
        logger.warn('Failed to get daily coding tip. Returning fallback.', { error: e.message });
        return `Tip: Keep your functions small! Each function should ideally do only one thing.`;
    }
}
