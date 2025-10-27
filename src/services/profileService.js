import { serverSupabase } from '../utils/supabaseClient.js'; 

const USER_PROFILE_TABLE = 'user_profile';


export async function getProfileByUserId(userId) {
    if (!userId) {
        throw new Error('User ID is required to fetch profile.');
    }

    try {
        
        const { data, error } = await serverSupabase
            .from(USER_PROFILE_TABLE)
            .select('id, username, xp, streak, last_active')
            .eq('id', userId)
            .single(); 

       
        if (error && error.code !== 'PGRST116') { 
            console.error(`[ProfileService] Database Error fetching profile for ${userId}:`, error);
            throw new Error('Database error retrieving user profile.');
        }

      
        if (!data) {
            return null;
        }

        return data;

    } catch (error) {
        
        console.error(`[ProfileService] Unexpected error in getProfileByUserId: ${error.message}`);
        throw new Error('Internal server error during profile fetch.');
    }
}


export async function createNewUserProfile(userId, username = null) {
    if (!userId) {
        throw new Error('User ID is required to create a new profile.');
    }

    try {
        
        const newProfile = {
            id: userId,
           
            username: username || `user_${userId.substring(0, 8)}`, 
            xp: 0,
            streak: 0,
            last_active: new Date().toISOString(),
        };

        const { data, error } = await serverSupabase
            .from(USER_PROFILE_TABLE)
            .insert([newProfile])
            .select('id, username, xp, streak, last_active')
            .single();

        if (error) {
            console.error(`[ProfileService] Database Error creating profile for ${userId}:`, error);
            throw new Error('Database error creating user profile.');
        }

        return data;

    } catch (error) {
        console.error(`[ProfileService] Unexpected error in createNewUserProfile: ${error.message}`);
        throw new Error('Internal server error during profile creation.');
    }
}


export async function updateProfileXPAndStreak(userId, xpIncrease, streakMaintained) {
    if (!userId) {
        throw new Error('User ID is required for profile update.');
    }

    try {
        
        const currentProfile = await getProfileByUserId(userId);
        if (!currentProfile) {
            throw new Error('Profile not found for update.');
        }

        
        const newStreak = streakMaintained ? currentProfile.streak + 1 : currentProfile.streak;

        const updateData = {
            xp: currentProfile.xp + xpIncrease,
            streak: newStreak,
            last_active: new Date().toISOString(),
        };

        const { data, error } = await serverSupabase
            .from(USER_PROFILE_TABLE)
            .update(updateData)
            .eq('id', userId)
            .select('id, username, xp, streak, last_active')
            .single();

        if (error) {
            console.error(`[ProfileService] Database Error updating profile for ${userId}:`, error);
            throw new Error('Database error updating user profile.');
        }

        return data;

    } catch (error) {
        console.error(`[ProfileService] Unexpected error in updateProfileXPAndStreak: ${error.message}`);
        throw new Error('Internal server error during profile update.');
    }
}


export default {
    getProfileByUserId,
    createNewUserProfile,
    updateProfileXPAndStreak,
};
