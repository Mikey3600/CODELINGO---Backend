import { createClient } from '@supabase/supabase-js';
// CRITICAL FIX: This line loads environment variables from your local .env file.
import 'dotenv/config'; 
import logger from './logger.js'; 

// Environment variables are mandatory for security
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    logger.error("FATAL ERROR: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set in environment variables.");
    // Halt the process immediately if mandatory keys are missing
    process.exit(1);
}

/**
 * @exports serverSupabase
 * @description The Supabase client initialized with the Service Role Key for secure backend operations.
 */
export const serverSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

logger.info("Supabase Service Role Client initialized successfully.");


/**
 * @exports browserSupabase
 * @function browserSupabase
 * @description Creates a client instance for use in a browser environment (using ANON key).
 * @param {string} [anonKey=SUPABASE_ANON_KEY] - The public anonymous key.
 * @returns {object} Supabase client instance.
 */
export const browserSupabase = (anonKey = SUPABASE_ANON_KEY) => {
    if (!anonKey) {
        logger.warn("SUPABASE_ANON_KEY is not set. Browser client creation may fail outside this backend.");
    }
    // Note: The browser client uses the ANON key, which is why we included it in the checks above.
    return createClient(SUPABASE_URL, anonKey);
};

export default serverSupabase;
