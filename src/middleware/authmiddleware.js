
import { serverSupabase } from '../utils/supabaseClient.js'; 
import logger from '../utils/logger.js'; 

const authMiddleware = async (req, res, next) => {
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
       
        return res.status(401).json({ error: 'Unauthorized: Missing or malformed token.' });
    }

    const token = authHeader.split(' ')[1];

    try {
       
        const { data, error } = await serverSupabase.auth.getUser(token);

        if (error || !data.user) {
            logger.error('Supabase Auth Verification Error:', error ? error.message : 'No user found after verification.');
            return res.status(401).json({ error: 'Unauthorized: Invalid token or user does not exist.' });
        }

        
        req.user = data.user;
        next();

    } catch (error) {
        
        logger.error('Supabase Auth Middleware Exception (500 Error):', error.message);
        
        return res.status(500).json({ error: 'Internal server error during token verification.' });
    }
};

export default authMiddleware;


