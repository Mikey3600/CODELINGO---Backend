import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import process from 'process';

// Load environment variables immediately
dotenv.config();

// --- UTILITIES AND MIDDLEWARE ---
import { serverSupabase } from './utils/supabaseClient.js'; 
import { errorHandler } from './middleware/errormiddleware.js';

// --- ROUTE IMPORTS ---
import * as authRoutesModule from './routes/authRoutes.js';
import * as lessonRoutesModule from './routes/lessonRoutes.js';
import * as challengeRoutesModule from './routes/challengeRoutes.js';
import * as projectRoutesModule from './routes/projectRoutes.js';
import * as dsaRoutesModule from './routes/dsaroute.js';
import * as aiRoutesModule from './routes/airoute.js';
import * as gamificationRoutesModule from './routes/gamefication.js';
import * as adaptiveTestRoutesModule from './routes/adaptiveTestroute.js';
import * as userRoutesModule from './routes/userroute.js';
import * as openaiRoutesModule from './routes/languageroute.js';


// -------------------------------------------------------------------
// --- ROUTE RESOLVER UTILITY ---
// Handles mixed CJS/ESM exports to reliably get the Express Router instance.
// -------------------------------------------------------------------

/**
 * Resolves the imported module to an Express router instance.
 * @param {object} module - The imported module object (e.g., authRoutesModule).
 * @returns {express.Router} The Express router instance.
 */
function resolveRouter(module) {
    // Tries to get the default export, a named 'router' export, or the module itself.
    const router = module.default || module.router || module;
    
    // Optional: Add a safety check to ensure what we got is actually a function (an Express Router)
    if (typeof router !== 'function') {
        console.error(`[Route Error] Imported module is not a router function:`, module);
        throw new TypeError(`Route path must be a function (router). Check the export of the route file.`);
    }

    return router;
}

// -----------------------------------------------------------
// 1. ROUTE RESOLUTION
// -----------------------------------------------------------

const authRoutes = resolveRouter(authRoutesModule);
const lessonRoutes = resolveRouter(lessonRoutesModule);
const challengeRoutes = resolveRouter(challengeRoutesModule);
const projectRoutes = resolveRouter(projectRoutesModule);
const dsaRoutes = resolveRouter(dsaRoutesModule);
const aiRoutes = resolveRouter(aiRoutesModule);
const gamificationRoutes = resolveRouter(gamificationRoutesModule);
const adaptiveTestRoutes = resolveRouter(adaptiveTestRoutesModule);
const userRoutes = resolveRouter(userRoutesModule);
const openaiRoutes = resolveRouter(openaiRoutesModule);


// --- APP SETUP ---
const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// -----------------------------------------------------------
// 2. STARTUP RELIABILITY CHECK
// -----------------------------------------------------------

function checkEnvironmentVariables() {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
        console.error("FATAL ERROR: Supabase environment variables are missing.");
        console.error("Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file.");
        process.exit(1);
    }
}

checkEnvironmentVariables();

async function preFlightCheck() {
    try {
        // Test connection by attempting a minimal, permission-safe query
        const { error } = await serverSupabase.from('user_profile').select('id').limit(0);
        
        if (error) {
            console.error("DATABASE CONNECTION ERROR: Failed to connect to Supabase or invalid service key.");
            console.error("Supabase Error Details:", error.message); 
            // We don't exit here, as some errors might be temporary, but we log prominently.
        } else {
            console.log(`[DB Check] Supabase connection confirmed.`);
        }

    } catch (e) {
        console.error(`[DB Check] FATAL ERROR during Database Pre-Flight: ${e.message}`);
        // Consider removing this exit in production if you want the app to start even without the DB for a bit.
        process.exit(1); 
    }
}


// -----------------------------------------------------------
// 3. MIDDLEWARE CONFIGURATION
// -----------------------------------------------------------

const corsOrigins = NODE_ENV === 'production' 
    ? ['https://your.codelingo.web.app', 'https://your.codelingo.mobile.app']
    : '*';

const corsOptions = {
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json()); // For parsing application/json
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev')); // Request logging


// -----------------------------------------------------------
// 4. ROUTE REGISTRATION
// -----------------------------------------------------------

// Consolidated Route Array for clean registration
const routes = [
    { path: '/api/auth', router: authRoutes }, 
    { path: '/api/lessons', router: lessonRoutes }, 
    { path: '/api/challenges', router: challengeRoutes },
    { path: '/api/projects', router: projectRoutes },
    { path: '/api/dsa', router: dsaRoutes },
    { path: '/api/ai', router: aiRoutes },
    { path: '/api/gamification', router: gamificationRoutes },
    { path: '/api/adaptive-tests', router: adaptiveTestRoutes },
    { path: '/api/users', router: userRoutes },
    { path: '/api/openai', router: openaiRoutes },
];

routes.forEach(({ path, router }) => {
    app.use(path, router);
});


// Health Check Route
app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'CodeLingo Backend', environment: NODE_ENV });
});


// Error Handling Middleware (must be last)
app.use(errorHandler);


// -----------------------------------------------------------
// 5. SERVER START
// -----------------------------------------------------------

preFlightCheck().then(() => {
    app.listen(PORT, () => {
        console.log(`\n-----------------------------------------`);
        console.log(`🚀 CodeLingo Backend running on port ${PORT}`);
        console.log(`🌎 Environment: ${NODE_ENV}`);
        console.log(`🔒 CORS Policy: ${Array.isArray(corsOrigins) ? corsOrigins.join(', ') : 'All Origins (*)'}`);
        console.log(`-----------------------------------------\n`);
    });
});
