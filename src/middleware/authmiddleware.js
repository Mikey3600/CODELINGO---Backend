// NOTE: This file assumes that '../utils/supabaseClient.js' exports a 
// 'serverSupabase' instance that was initialized using the **Supabase Service Role Key**.
import { serverSupabase } from '../utils/supabaseClient.js'; 
import logger from '../utils/logger.js'; // Assuming you have a logger utility

const authMiddleware = async (req, res, next) => {
    // 1. Extract the JWT from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // Use a 401 response for clearer debugging
        return res.status(401).json({ error: 'Unauthorized: Missing or malformed token.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // FIX: Using the correct function for server-side token verification with 
        // a client initialized with the Service Role Key.
        const { data, error } = await serverSupabase.auth.getUser(token);

        if (error || !data.user) {
            logger.error('Supabase Auth Verification Error:', error ? error.message : 'No user found after verification.');
            return res.status(401).json({ error: 'Unauthorized: Invalid token or user does not exist.' });
        }

        // 3. Attach the authenticated user object to the request for downstream use
        req.user = data.user;
        next();

    } catch (error) {
        // This catches network errors or unexpected client issues
        logger.error('Supabase Auth Middleware Exception (500 Error):', error.message);
        // We return a generic 500 error here to prevent leaking internal error details.
        return res.status(500).json({ error: 'Internal server error during token verification.' });
    }
};

export default authMiddleware;


