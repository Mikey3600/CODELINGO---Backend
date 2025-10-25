import express from 'express';
// CRITICAL FIX 1: Initialize the Express Router
const router = express.Router();

import { serverSupabase } from '../utils/supabaseClient.js';
import AppError from '../utils/apperror.js'; // Assuming this correctly handles error formatting
import logger from '../utils/logger.js'; // Added logger import for better server-side debugging

const PROFILE_TABLE = 'user_profile';
 // Corresponds to the profiles table in your data_model.sql

// =========================================================================
// 1. CORE LOGIC FUNCTIONS (Exported for testing or reuse elsewhere)
// =========================================================================

/**
 * @function registerUser
 * @description Registers a new user via Supabase Auth and creates their profile entry.
 * @param {string} email - User's email address.
 * @param {string} password - User's password.
 * @param {string} username - Desired unique username.
 * @returns {Promise<object>} The new profile data.
 */
export const registerUser = async (email, password, username) => {
    
    // 1. Check for existing username (must be done before auth.signUp)
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

    // 2. Register with Supabase Auth
    const { data: authData, error: authError } = await serverSupabase.auth.signUp({
        email,
        password,
        options: {
            data: { username }, 
        }
    });

    if (authError) {
        // Auth errors (e.g., weak password, user already registered)
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

    // 3. Create initial profile entry
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
        // Log the failure to create the profile for the user that was just created
        logger.error(`Failed to create profile for user ID ${user.id}: ${profileError.message}`);
        
        // In a real application, you should also delete the user from Supabase Auth here
        // await serverSupabase.auth.admin.deleteUser(user.id);
        
        throw new AppError(`Database error creating profile: ${profileError.message}`, 500);
    }

    return newProfile;
};

/**
 * @function loginUser
 * @description Logs in a user using Supabase Auth and fetches profile data.
 * @param {string} email - User's email address.
 * @param {string} password - User's password.
 * @returns {Promise<object>} The user's JWT session and profile data.
 */
export const loginUser = async (email, password) => {
    const { data: authData, error: authError } = await serverSupabase.auth.signInWithPassword({
        email,
        password,
    });

    if (authError) {
        // Supabase returns 400 for invalid credentials
        throw new AppError('Invalid email or password.', 401);
    }

    const { user, session } = authData;
    
    // Fetch the detailed profile data
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
    // Note: Server-side sign out invalidates the session on the server, 
    // but the client must still delete the token locally.
    const { error } = await serverSupabase.auth.signOut();
    if (error) {
        throw new AppError(`Error during server-side logout: ${error.message}`, 500);
    }
};

// =========================================================================
// 2. EXPRESS ROUTE DEFINITIONS (Endpoints)
// =========================================================================

/**
 * POST /api/v1/auth/register
 * Registers a new user.
 */
router.post('/register', async (req, res, next) => {
    const { email, password, username } = req.body;
    
    // Basic input validation
    if (!email || !password || !username) {
        return next(new AppError('Email, password, and username are required for registration.', 400));
    }
    
    try {
        const profile = await registerUser(email, password, username);
        // Successful registration response
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
        // Pass error to Express error handler middleware
        next(err);
    }
});

/**
 * POST /api/v1/auth/login
 * Logs in a user.
 */
router.post('/login', async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Email and password are required for login.', 400));
    }

    try {
        const { token, user } = await loginUser(email, password);
        
        // Successful login response
        res.status(200).json({ 
            status: 'success', 
            message: 'Login successful.',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                current_xp: user.current_xp,
                // ... include other relevant profile fields
            } 
        });
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/v1/auth/logout
 * Logs out the user (server-side invalidation).
 * NOTE: For full effect, the client must also destroy its JWT/session token.
 */
router.post('/logout', async (req, res, next) => {
    try {
        // Since we are using the Service Role key in serverSupabase,
        // this logout invalidates the user's session globally, making 
        // their token unusable from the server's perspective.
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