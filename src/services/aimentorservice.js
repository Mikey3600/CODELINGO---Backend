import logger from '../utils/logger.js'; 

const API_KEY = process.env.GEMINI_API_KEY || ""; 
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL_NAME = 'gemini-2.5-flash-preview-09-2025';


const MAX_RETRIES = 3;


if (!API_KEY) {
    logger.error("FATAL ERROR: GEMINI_API_KEY is not set. AI services will not function.");
    
}


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
                
                
                if (response.status === 429 || response.status >= 500) {
                    const delay = Math.pow(2, attempt) * 1000; // Exponential backoff (1s, 2s, 4s...)
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue; 
                }
                
                
                const errorBody = await response.text();
                throw new Error(`Gemini API error ${response.status}: ${errorBody}`);
            }

            return await response.json();

        } catch (error) {
            
            console.warn(`Attempt ${attempt + 1} failed: ${error.message}`);
            
            if (attempt === MAX_RETRIES - 1) {
                
                throw new Error(`Failed to communicate with Gemini API after ${MAX_RETRIES} attempts: ${error.message}`);
            }
            
           
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}


export async function getMentorChatResponse(chatHistory, systemInstruction, useGrounding = false) {
   
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
        
        const finishReason = response.candidates?.[0]?.finishReason;
        throw new Error(`AI response was empty or malformed. Finish reason: ${finishReason || 'UNKNOWN'}`);
    }

    return text;
}



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
       
        console.error("Failed to parse AI generated JSON:", jsonText);
        throw new Error('AI generated malformed JSON structure.');
    }
}

export default {
    getMentorChatResponse,
    generateLessonQuestions
};
