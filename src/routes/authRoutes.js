import express from 'express';

const router = express.Router();

// सुनिश्चित करें कि serverSupabase Admin Key के साथ initialized है
import { serverSupabase } from '../utils/supabaseClient.js';
import AppError from '../utils/apperror.js'; 
import logger from '../utils/logger.js'; 
const PROFILE_TABLE = 'user_profile';


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
        // यह स्थिति केवल तभी होनी चाहिए जब Supabase एक session न लौटाए,
        // लेकिन signup सफल हो जाए (जैसे email confirmation चालू हो तो)
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
        logger.error(`Failed to create profile for user ID ${user.id}: ${profileError.message}`);
        // IMPORTANT: यहां आपको यूज़र को auth.users से हटा देना चाहिए ताकि Ghost User न बनें।
        // हालाँकि, सुरक्षा कारणों से Supabase Admin Client ही यह कर सकता है,
        // और हम मान रहे हैं कि serverSupabase एक Admin Client है।
        // इसे और जटिल न बनाते हुए, हम बस error throw कर रहे हैं।
        throw new AppError(`Database error creating profile: ${profileError.message}`, 500);
    }
    
    // -----------------------------------------------------------
    // 4. Manually Confirm Email (Fix NULL issue for immediate login)
    // "now thing" fix: RPC call for immediate email confirmation
    // Note: This relies on the SQL function below being created in Supabase.
    // -----------------------------------------------------------
    const { error: confirmationError } = await serverSupabase
        .rpc('confirm_user_email_manually', { user_id_param: user.id });

    if (confirmationError) {
        // यह एक चेतावनी (Warning) है, गंभीर error नहीं है, क्योंकि user और profile बन चुके हैं।
        logger.warn(`Failed to manually confirm email for user ID ${user.id} via RPC: ${confirmationError.message}`);
    }

    return newProfile;
};


export const loginUser = async (email, password) => {
    const { data: authData, error: authError } = await serverSupabase.auth.signInWithPassword({
        email,
        password,
    });

    if (authError) {
       // यदि email_confirmed_at NULL है, तो Supabase आमतौर पर "Invalid email or password" error देता है।
       // हमारा फिक्स (Step 4) अब यह सुनिश्चित करता है कि loginUser को यह error न मिले।
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
    // Note: Client-side logout is generally preferred for token destruction,
    // but this server-side call handles the session cleanup if needed.
    const { error } = await serverSupabase.auth.signOut();
    if (error) {
        throw new AppError(`Error during server-side logout: ${error.message}`, 500);
    }
};


router.post('/register', async (req, res, next) => {
    const { email, password, username } = req.body;
    
    
    if (!email || !password || !username) {
        return next(new AppError('Email, password, and username are required for registration.', 400));
    }
    
    try {
        const profile = await registerUser(email, password, username);
        
        res.status(201).json({ 
            status: 'success', 
            // संदेश में बदलाव किया गया है, क्योंकि अब यह तुरंत काम करता है।
            message: 'Registration and profile creation successful. Ready for login.',
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
