
import jwt from 'jsonwebtoken';
import { serverSupabase } from '../../index.js'; 
import profileService from '../services/profileService.js'; 


const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRES_IN = '7d';


const generateAuthToken = (userId, email) => {
    return jwt.sign({ id: userId, email: email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};


export const registerController = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;
        
        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

       
        const { data: authData, error: authError } = await serverSupabase.auth.signUp({
            email,
            password,
            options: {
                data: { name } 
            }
        });

        if (authError) {
            
            if (authError.message.includes('already registered')) {
                return res.status(409).json({ message: 'Email already registered' });
            }
            console.error('[AuthCtrl] Supabase Sign Up Error:', authError.message);
            return res.status(500).json({ message: 'Authentication service error during registration.' });
        }

        const userId = authData.user.id;
        
        
        const profile = await profileService.createNewUserProfile(userId, name);

        
        const token = generateAuthToken(userId, email);

       
        res.status(201).json({ 
            token, 
            user: { 
                id: userId, 
                email, 
                name,
          
                xp: profile.xp,
                streak: profile.streak,
            } 
        });

    } catch (error) {
        
        next(error);
    }
};

 loginController = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

      
        const { data: authData, error: authError } = await serverSupabase.auth.signInWithPassword({
            email,
            password
        });

        if (authError) {
            
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        const user = authData.user;
        const userId = user.id;

       
        const profile = await profileService.getProfileByUserId(userId);
        
        if (!profile) {
            
            await profileService.createNewUserProfile(userId, user.user_metadata.name); 
        }

       
        const token = generateAuthToken(userId, email);

       
        res.json({ 
            token, 
            user: { 
                id: userId, 
                email: user.email, 
                name: user.user_metadata.name || profile.username, 
                streak: profile?.streak || 0,
            } 
        });

    } catch (error) {
        next(error);
    }
};


export const getProfileController = async (req, res, next) => {
    try {
        const userId = req.user?.id; 
        
        if (!userId) {
            
            return res.status(401).json({ message: 'Unauthorized' });
        }
        
       
        const { data: authUser, error: authError } = await serverSupabase.auth.admin.getUserById(userId);
        
        if (authError || !authUser?.user) {
            return res.status(404).json({ message: 'User not found in authentication system.' });
        }
        
        const user = authUser.user;
    
        const profile = await profileService.getProfileByUserId(userId);

        if (!profile) {
            return res.status(404).json({ message: 'Gamified profile data not found.' });
        }

       
        res.json({
            id: user.id,
            email: user.email,
            name: user.user_metadata.name || profile.username,
            xp: profile.xp,
            streak: profile.streak,
        });

    } catch (error) {
        next(error);
    }
};


export const updateProfileController = async (req, res, next) => {
    try {
        const userId = req.user?.id; 
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        
        const updates = req.body;
        
    
        const authUpdates = {};
        
        if (updates.email) {
            authUpdates.email = updates.email;
        }
        if (updates.name) {
            authUpdates.data = { name: updates.name }; 
         
            authUpdates.password = updates.password; 
        }

       
        const { data: updatedAuthData, error: updateError } = await serverSupabase.auth.admin.updateUserById(
            userId, 
            authUpdates
        );

        if (updateError) {
            console.error('[AuthCtrl] Supabase Update Error:', updateError.message);
            return res.status(400).json({ message: 'Error updating authentication details.' });
        }

        const updatedUser = updatedAuthData.user;
        
        
        let updatedProfile = {};
        if (updates.name) {
             updatedProfile = await profileService.updateUsername(userId, updates.name);
        } else {
             
             updatedProfile = await profileService.getProfileByUserId(userId);
        }

        res.json({
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.user_metadata.name,
            xp: updatedProfile?.xp || 0,
            streak: updatedProfile?.streak || 0,
        });

    } catch (error) {
        next(error);
    }
};