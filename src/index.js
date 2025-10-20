
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { createClient } from '@supabase/supabase-js';

import authRoutes from './routes/authRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import challengeRoutes from './routes/challengeRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import dsaRoutes from './routes/dsaroute.js';
import aiRoutes from './routes/airoute.js';
import gamificationRoutes from './routes/gamefication.js';
import adaptiveTestRoutes from './routes/adaptiveTestroute.js';
import userRoutes from './routes/userroute.js';
import leetcodeRoutes from './routes/leetcoderoute.js';
import openaiRoutes from './routes/openairoute.js';
import { errorHandler } from './middleware/errormiddleware.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Supabase client setup (optional global export)
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/dsa', dsaRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/adaptive-tests', adaptiveTestRoutes);

// Error handler middleware (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`CodeLingo backend running on port ${PORT}`);
});