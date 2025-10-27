import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import process from 'process';


dotenv.config();


import { serverSupabase } from './utils/supabaseClient.js'; 
import { errorHandler } from './middleware/errormiddleware.js';


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




function resolveRouter(module) {
    
    const router = module.default || module.router || module;
    
   
    if (typeof router !== 'function') {
        console.error(`[Route Error] Imported module is not a router function:`, module);
        throw new TypeError(`Route path must be a function (router). Check the export of the route file.`);
    }

    return router;
}


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



const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';



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
        
        const { error } = await serverSupabase.from('user_profile').select('id').limit(0);
        
        if (error) {
            console.error("DATABASE CONNECTION ERROR: Failed to connect to Supabase or invalid service key.");
            console.error("Supabase Error Details:", error.message); 
           
        } else {
            console.log(`[DB Check] Supabase connection confirmed.`);
        }

    } catch (e) {
        console.error(`[DB Check] FATAL ERROR during Database Pre-Flight: ${e.message}`);
        
        process.exit(1); 
    }
}



const corsOrigins = NODE_ENV === 'production' 
    ? ['https://your.codelingo.web.app', 'https://your.codelingo.mobile.app']
    : '*';

const corsOptions = {
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json()); 
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev')); 



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



app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'CodeLingo Backend', environment: NODE_ENV });
});



app.use(errorHandler);



preFlightCheck().then(() => {
    app.listen(PORT, () => {
        
        console.log(` CodeLingo Backend running on port ${PORT}`);
        console.log(` Environment: ${NODE_ENV}`);
        console.log(` CORS Policy: ${Array.isArray(corsOrigins) ? corsOrigins.join(', ') : 'All Origins (*)'}`);
        
    });
});
