import logger from '../utils/logger.js'; // Assuming you have a logger utility

// CRITICAL FIX: Removed redundant dotenv import and config call. 
// Environment variables are assumed to be loaded by the main server file (app.js/server.js).

const API_KEY = process.env.GEMINI_API_KEY || ""; 
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL_NAME = 'gemini-2.5-flash-preview-09-2025';


const MAX_RETRIES = 3;

// --- INITIAL CHECK ---
if (!API_KEY) {
    logger.error("FATAL ERROR: GEMINI_API_KEY is not set. AI services will not function.");
    // We will still export functions, but they will fail immediately with an error.
}

/**
 * Executes a Gemini API call with exponential backoff and retry logic.
 * @param {string} endpoint - The API endpoint (e.g., 'generateContent').
 * @param {object} payload - The request payload for the API.
 * @returns {Promise<object>} - The parsed JSON response from the API.
 * @throws {Error} - If the API call fails after all retries.
 */
async function generateWithRetry(endpoint, payload) {
    if (!API_KEY) {
        throw new Error("Gemini API key is missing. Cannot perform AI operation.");
    }
    
    const url = `${BASE_URL}/${MODEL_NAME}:${endpoint}?key=${API_KEY}`;
    
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                
                // Retry on rate limit (429) or server errors (5xx)
                if (response.status === 429 || response.status >= 500) {
                    const delay = Math.pow(2, attempt) * 1000; // Exponential backoff (1s, 2s, 4s...)
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue; 
                }
                
                // Throw for other non-retriable errors (e.g., 400, 401, 403)
                const errorBody = await response.text();
                throw new Error(`Gemini API error ${response.status}: ${errorBody}`);
            }

            return await response.json();

        } catch (error) {
            // Console logging is fine here for immediate debugging
            console.warn(`Attempt ${attempt + 1} failed: ${error.message}`);
            
            if (attempt === MAX_RETRIES - 1) {
                // Throw final error after last attempt
                throw new Error(`Failed to communicate with Gemini API after ${MAX_RETRIES} attempts: ${error.message}`);
            }
            
            // Wait for the next retry
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}


/**
 * Gets a conversational response from the AI mentor.
 * @param {Array<object>} chatHistory - The history of messages for the model.
 * @param {string} systemInstruction - The system prompt defining the mentor's persona.
 * @param {boolean} useGrounding - Whether to use Google Search grounding.
 * @returns {Promise<string>} - The generated text response.
 */
export async function getMentorChatResponse(chatHistory, systemInstruction, useGrounding = false) {
    // This check handles the case where the key was missing at startup.
    if (!API_KEY) {
        throw new Error("AI service is unavailable because the API key is missing.");
    }
    
    const payload = {
        contents: chatHistory,
        systemInstruction: {
            parts: [{ text: systemInstruction }]
        },
        tools: useGrounding ? [{ "google_search": {} }] : undefined,
    };

    const response = await generateWithRetry('generateContent', payload);

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
        // Check for specific error reasons if possible
        const finishReason = response.candidates?.[0]?.finishReason;
        throw new Error(`AI response was empty or malformed. Finish reason: ${finishReason || 'UNKNOWN'}`);
    }

    return text;
}


/**
 * Generates structured quiz questions for a lesson.
 * @param {string} topic - The topic for the questions.
 * @param {number} numQuestions - The number of questions to generate.
 * @returns {Promise<Array<object>>} - An array of structured question objects.
 */
export async function generateLessonQuestions(topic, numQuestions = 3) {
    if (!API_KEY) {
        throw new Error("AI service is unavailable because the API key is missing.");
    }

    const systemPrompt = `You are a curriculum expert for language learning. Generate ${numQuestions} distinct grammar or vocabulary questions about the topic "${topic}". The output MUST be a JSON array of objects with the keys 'type' (must be 'translate', 'match_pair', or 'select_word'), 'prompt', 'correct_answer' (string or array), and 'options' (array of strings, optional).`;

    const payload = {
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        "type": { "type": "STRING", enum: ['translate', 'match_pair', 'select_word'] },
                        "prompt": { "type": "STRING" },
                        "correct_answer": { 
                            // The answer can be a string (for select/translate) or an array (for match_pair)
                            type: ["STRING", "ARRAY"], 
                            items: { type: "STRING" } 
                        },
                        "options": { 
                            type: "ARRAY", 
                            items: { type: "STRING" } 
                        }
                    },
                    required: ["type", "prompt", "correct_answer"]
                }
            }
        },
    };

    const response = await generateWithRetry('generateContent', payload);

    const jsonText = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!jsonText) {
        throw new Error('AI failed to generate valid JSON for questions (empty response).');
    }

    try {
        return JSON.parse(jsonText);
    } catch (e) {
        // Console log the raw text to aid debugging the AI output
        console.error("Failed to parse AI generated JSON:", jsonText);
        throw new Error('AI generated malformed JSON structure.');
    }
}

export default {
    getMentorChatResponse,
    generateLessonQuestions
};
