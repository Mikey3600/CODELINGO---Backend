import logger from '../utils/logger.js'; // Assuming you have a logger utility

// --- Configuration ---
// Get API Key from environment variables
const API_KEY = process.env.GEMINI_API_KEY;
const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL_NAME = 'gemini-2.5-flash-preview-09-2025';

if (!API_KEY) {
    logger.error("GEMINI_API_KEY is not set in environment variables!");
    throw new Error("Missing GEMINI_API_KEY. AI services cannot function.");
}

// --- Utility Function with Exponential Backoff ---

/**
 * Calls the Gemini API with retry logic for transient errors (429, 500, 503).
 * @param {string} endpoint The full URL for the API call.
 * @param {object} payload The JSON payload for the request.
 * @param {number} maxRetries Maximum number of retries.
 * @returns {Promise<object>} The JSON response data from the API.
 */
async function callGeminiApiWithRetry(endpoint, payload, maxRetries = 3) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // API Key is passed via the query parameter, which is standard for this API usage
                },
                body: JSON.stringify(payload),
            });

            const responseData = await response.json();

            if (response.ok) {
                // Successful response
                return responseData;
            }

            // Handle non-OK responses
            if (response.status === 429 || response.status === 500 || response.status === 503) {
                // Transient errors: Wait and retry
                const delay = Math.pow(2, attempt) * 1000 + (Math.random() * 1000); // 1s, 2s, 4s + jitter
                logger.warn(`API call failed with status ${response.status}. Retrying in ${delay}ms (Attempt ${attempt + 1}/${maxRetries}).`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue; // Skip to the next attempt
            }

            // Non-transient errors (e.g., 400, 403, 404, bad API Key)
            logger.error(`Gemini API Fatal Error (Status ${response.status}):`, responseData);
            // Throw a specific error to be caught by the main controller
            throw new Error(`Gemini API Error: ${response.status} - ${JSON.stringify(responseData.error || responseData)}`);

        } catch (error) {
            // Catches network errors, JSON parsing errors, or the re-thrown fatal API error
            logger.error(`Network or Parsing error during API call: ${error.message}`);
            // If this is the last attempt, re-throw the error
            if (attempt === maxRetries - 1) throw error; 

            // Otherwise, apply backoff and retry
            const delay = Math.pow(2, attempt) * 1000 + (Math.random() * 1000);
            logger.warn(`Network failure. Retrying in ${delay}ms (Attempt ${attempt + 1}/${maxRetries}).`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}


// --- Controller Functions ---

/**
 * Handles a chat request to the AI mentor.
 * POST /api/v1/ai/chat
 */
export const handleAIChat = async (req, res) => {
    // Note: req.user is populated by the 'protect' middleware.
    const { prompt, chatHistory = [] } = req.body; 

    if (!prompt) {
        return res.status(400).json({ status: 'error', message: 'Chat prompt is required.' });
    }

    const apiUrl = `${API_BASE_URL}/${MODEL_NAME}:generateContent?key=${API_KEY}`;
    
    // Convert client-side history format to the API's format
    // Assuming the client history is in [{ role: 'user' | 'model', parts: [{ text: '...' }] }] format
    const contents = [...chatHistory, { role: "user", parts: [{ text: prompt }] }];

    const payload = {
        contents: contents,
        tools: [{ "google_search": {} }], // Enable grounding for relevant, up-to-date responses
        systemInstruction: {
            parts: [{ text: `You are a friendly, encouraging, and knowledgeable AI mentor 
                for coding students. Provide helpful, conversational explanations and guidance. 
                Keep your responses concise.` }]
        },
    };

    try {
        const result = await callGeminiApiWithRetry(apiUrl, payload);

        const candidate = result.candidates?.[0];
        const generatedText = candidate?.content?.parts?.[0]?.text;

        if (!generatedText) {
            // This catches cases where the API call succeeded but returned no text (e.g., was blocked)
            logger.error('AI response failed to generate text:', result);
            return res.status(500).json({ 
                status: 'error', 
                message: 'AI response was empty or blocked.', 
                details: result 
            });
        }
        
        // Extract grounding sources (citations)
        let sources = [];
        const groundingMetadata = candidate.groundingMetadata;
        if (groundingMetadata && groundingMetadata.groundingAttributions) {
            sources = groundingMetadata.groundingAttributions
                .map(attr => ({ uri: attr.web?.uri, title: attr.web?.title }))
                .filter(source => source.uri && source.title);
        }

        return res.status(200).json({ 
            status: 'success', 
            data: { 
                text: generatedText, 
                sources: sources 
            } 
        });

    } catch (error) {
        // Line 35 is now handled within the robust callGeminiApiWithRetry function.
        // If it reaches here, it's a final, fatal error.
        logger.error('Final error in handleAIChat:', error.message);
        return res.status(500).json({ 
            status: 'error', 
            message: "Failed to get response from AI mentor.",
            details: error.message 
        });
    }
};

/**
 * Handles a request to generate questions based on provided text/context.
 * POST /api/v1/ai/generate-questions
 */
export const handleAIGenerateQuestions = async (req, res) => {
    const { contextText, difficulty = 'Medium' } = req.body;

    if (!contextText) {
        return res.status(400).json({ status: 'error', message: 'Context text is required to generate questions.' });
    }
    
    const apiUrl = `${API_BASE_URL}/${MODEL_NAME}:generateContent?key=${API_KEY}`;

    const userQuery = `Using the following text as context, generate 5 detailed, ${difficulty} difficulty multiple-choice questions suitable for a coding student. The questions must test comprehension and application.
    CONTEXT:
    ---
    ${contextText}
    ---
    Format your response STRICTLY as a JSON array of objects, with each object having the properties: 'question', 'options' (array of strings, where the first element is the correct answer), and 'explanation'.`;

    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        "question": { "type": "STRING", "description": "The multiple choice question text." },
                        "options": { 
                            "type": "ARRAY", 
                            "description": "An array of 4 strings for the options. The first string MUST be the correct answer.",
                            "items": { "type": "STRING" } 
                        },
                        "explanation": { "type": "STRING", "description": "A detailed explanation of the correct answer." }
                    }
                }
            }
        },
    };

    try {
        const result = await callGeminiApiWithRetry(apiUrl, payload);
        const generatedJsonString = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedJsonString) {
            logger.error('Question generation failed to return JSON string:', result);
            throw new Error('AI failed to generate structured questions.');
        }

        const questions = JSON.parse(generatedJsonString);
        
        return res.status(200).json({ 
            status: 'success', 
            data: questions 
        });

    } catch (error) {
        logger.error('Final error in handleAIGenerateQuestions:', error.message);
        return res.status(500).json({ 
            status: 'error', 
            message: "Failed to generate questions from AI.",
            details: error.message 
        });
    }
};