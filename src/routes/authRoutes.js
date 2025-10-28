import express from 'express';

const router = express.Router();

import { serverSupabase } from '../utils/supabaseClient.js';
import AppError from '../utils/apperror.js'; 
import logger from '../utils/logger.js'; 
const PROFILE_TABLE = 'user_profile';


export const registerUser = async (email, password, username) => {
    
    
    const { data: existingProfile, error: profileCheckError } = await serverSupabase
        .from(PROFILE_TABLE)
        .select('username')
        .eq('username', username)
        .limit(1);

    if (profileCheckError) {
        throw new AppError(`Database error checking username: ${profileCheckError.message}`, 500);
    }
    if (existingProfile && existingProfile.length > 0) {
        throw new AppError('Username already taken.', 409);
    }

    
    const { data: authData, error: authError } = await serverSupabase.auth.signUp({
        email,
        password,
        options: {
            data: { username }, 
        }
    });

    if (authError) {
        
        let statusCode = authError.status || 500;
        let message = authError.message;
        if (message.includes('already registered')) {
            statusCode = 409;
            message = 'User already exists with this email.';
        }
        throw new AppError(`Authentication error during signup: ${message}`, statusCode);
    }

    const user = authData.user;

    if (!user) {
        throw new AppError('Registration successful, but user object missing. Check email for confirmation if required.', 202);
    }

    
    const { data: newProfile, error: profileError } = await serverSupabase
        .from(PROFILE_TABLE)
        .insert({ 
            id: user.id, 
            username: username,
            email: email, 
            current_xp: 0 
        })
        .select()
        .single();

    if (profileError) {
        
        logger.error(`Failed to create profile for user ID ${user.id}: ${profileError.message}`);
        
       
        throw new AppError(`Database error creating profile: ${profileError.message}`, 500);
    }

    return newProfile;
};


export const loginUser = async (email, password) => {
    const { data: authData, error: authError } = await serverSupabase.auth.signInWithPassword({
        email,
        password,
    });

    if (authError) {
     
        throw new AppError('Invalid email or password.', 401);
    }
    const { user, session } = authData;
    
   
    const { data: profileData, error: profileError } = await serverSupabase
        .from(PROFILE_TABLE)
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError || !profileData) {
        logger.warn(`User ID ${user.id} logged in but profile not found: ${profileError?.message || 'No data'}`);
        throw new AppError('Profile data not found after successful login.', 500);
    }

    return {
        token: session.access_token,
        user: profileData
    };
};


export const logoutUser = async () => {
    
    const { error } = await serverSupabase.auth.signOut();
    if (error) {
        throw new AppError(`Error during server-side logout: ${error.message}`, 500);
    }
};


router.post('/register', async (req, res, next) => {
    const { email, password, username } = req.body;
    
    // Basic input validation
    if (!email || !password || !username) {
        return next(new AppError('Email, password, and username are required for registration.', 400));
    }
    
    try {
        const profile = await registerUser(email, password, username);
        
        res.status(201).json({ 
            status: 'success', 
            message: 'Registration successful. Profile created.',
            data: { 
                username: profile.username, 
                email: profile.email, 
                current_xp: profile.current_xp 
            } 
        });
    } catch (err) {
        
        next(err);
    }
});


router.post('/login', async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Email and password are required for login.', 400));
    }

    try {
        const { token, user } = await loginUser(email, password);
        
       
        res.status(200).json({ 
            status: 'success', 
            message: 'Login successful.',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                current_xp: user.current_xp,
                
            } 
        });
    } catch (err) {
        next(err);
    }
});


router.post('/logout', async (req, res, next) => {
    try {
        
        await logoutUser(); 
        
        res.status(200).json({ 
            status: 'success', 
            message: 'Logged out successfully.' 
        });
    } catch (err) {
        next(err);
    }
});


export default router;