import { createClient } from '@supabase/supabase-js';

import 'dotenv/config'; 
import logger from './logger.js'; 


const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    logger.error("FATAL ERROR: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set in environment variables.");
    
    process.exit(1);
}


export const serverSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

logger.info("Supabase Service Role Client initialized successfully.");



export const browserSupabase = (anonKey = SUPABASE_ANON_KEY) => {
    if (!anonKey) {
        logger.warn("SUPABASE_ANON_KEY is not set. Browser client creation may fail outside this backend.");
    }
   
    return createClient(SUPABASE_URL, anonKey);
};

export default serverSupabase;
