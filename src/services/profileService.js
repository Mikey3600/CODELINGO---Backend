import { serverSupabase } from '../utils/supabaseClient.js'; 

const USER_PROFILE_TABLE = 'user_profile';

/**
 * Retrieves a user profile by their ID.
 * @param {string} userId - The unique ID of the user.
 * @returns {Promise<object | null>} - The user profile object, or null if not found.
 * @throws {Error} - If userId is missing or a database error occurs.
 */
export async function getProfileByUserId(userId) {
    if (!userId) {
        throw new Error('User ID is required to fetch profile.');
    }

    try {
        // Query the database for the user profile matching the user ID
        const { data, error } = await serverSupabase
            .from(USER_PROFILE_TABLE)
            .select('id, username, xp, streak, last_active')
            .eq('id', userId)
            .single(); 

        // PGRST116 is the code for "No rows found" which is acceptable for single()
        if (error && error.code !== 'PGRST116') { 
            console.error(`[ProfileService] Database Error fetching profile for ${userId}:`, error);
            throw new Error('Database error retrieving user profile.');
        }

        // Return null if no data was found
        if (!data) {
            return null;
        }

        return data;

    } catch (error) {
        
        console.error(`[ProfileService] Unexpected error in getProfileByUserId: ${error.message}`);
        throw new Error('Internal server error during profile fetch.');
    }
}

/**
 * Creates a new user profile upon initial sign-up or first use.
 * @param {string} userId - The unique ID of the user.
 * @param {string | null} [username=null] - Optional initial username.
 * @returns {Promise<object>} - The newly created user profile object.
 * @throws {Error} - If userId is missing or a database error occurs.
 */
export async function createNewUserProfile(userId, username = null) {
    if (!userId) {
        throw new Error('User ID is required to create a new profile.');
    }

    try {
        
        const newProfile = {
            id: userId,
            // Create a default username if none is provided
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

/**
 * Updates a user's XP and streak.
 * @param {string} userId - The unique ID of the user.
 * @param {number} xpIncrease - The amount of XP to add to the current total.
 * @param {boolean} streakMaintained - True if the user maintained their streak, false otherwise.
 * @returns {Promise<object>} - The updated user profile object.
 * @throws {Error} - If the profile is not found or a database error occurs.
 */
export async function updateProfileXPAndStreak(userId, xpIncrease, streakMaintained) {
    if (!userId) {
        throw new Error('User ID is required for profile update.');
    }

    try {
        // Fetch current profile to calculate new streak/xp securely (read-before-write)
        const currentProfile = await getProfileByUserId(userId);
        if (!currentProfile) {
            throw new Error('Profile not found for update.');
        }

        // Calculate new streak
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
