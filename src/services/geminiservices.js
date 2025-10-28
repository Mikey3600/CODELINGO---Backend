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

    for (let i = 0; i < 3; i++) { 
        try {
            const response = await axios.post(apiUrl, payload, {
                headers: { 'Content-Type': 'application/json' },
                
                validateStatus: (status) => status >= 200 && status < 500
            });
            
            
            if (response.status === 429 && i < 2) {
                 const delay = Math.pow(2, i) * 1000;
                 logger.warn(`Gemini API rate limit hit (Status 429). Retrying in ${delay / 1000}ms...`);
                 await new Promise(resolve => setTimeout(resolve, delay));
                 continue; 
            }
            if (response.status >= 400) {
                 throw new AppError(`Gemini API request failed with status ${response.status}.`, response.status);
            }

          
            const candidate = response.data.candidates?.[0];

            if (candidate && candidate.content?.parts?.[0]?.text) {
                const text = candidate.content.parts[0].text;
                
                
                if (responseSchema) {
                    try {
                        return JSON.parse(text);
                    } catch (e) {
                        logger.error('Failed to parse Gemini JSON response.', { rawText: text, error: e.message });
                        throw new AppError('AI returned invalid JSON structure.', 500);
                    }
                }
                return text; 
            }

            logger.warn('Gemini response was empty or malformed.', { data: response.data });
            lastError = new AppError("AI returned empty or malformed content.", 500);
            throw lastError; 

        } catch (error) {
            
            if (error instanceof AppError) throw error; 
            
            
            lastError = new AppError(`Network or unexpected error during Gemini API call: ${error.message}`, 500);

            if (i === 2) throw lastError; 

            const delay = Math.pow(2, i) * 1000;
            logger.error(`Gemini API attempt failed. Retrying in ${delay / 1000}ms. Error: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw lastError; 
}



export async function generateAdaptiveTest(language, skillLevel, numQuestions = 5) {
   
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



export async function generateMentorResponse(history, userQuery) {
    
    const mentorUserPrompt = `Act as 'CodeLingo Mentor.' Provide a patient and encouraging response to this user query: ${userQuery}`;

    try {
        const responseText = await getGeminiResponse(mentorUserPrompt, null, history);
        return responseText;
    } catch (error) {
        logger.error(`Error generating mentor response: ${error.message}`);
        throw error;
    }
}


export async function getDailyCodingTip(language = 'JavaScript') {
    const prompt = `Generate a single, concise, and helpful coding tip (max 2 sentences) focused on a common pitfall or best practice in ${language}. Do not include a title or sign-off.`;
    
    try {
        
        const tip = await getGeminiResponse(prompt);
        return tip.trim();
    } catch (e) {
        logger.warn('Failed to get daily coding tip. Returning fallback.', { error: e.message });
        return `Tip: Keep your functions small! Each function should ideally do only one thing.`;
    }
}
