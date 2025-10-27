import { serverSupabase } from '../utils/supabaseClient.js';
import AppError from '../utils/apperror.js';
import logger from '../utils/logger.js';

const CHALLENGES_TABLE = 'challenges';
const USER_ATTEMPTS_TABLE = 'user_challenge_attempts';
const XP_PER_CHALLENGE = 50; 



export async function createChallenge(challengeData) {
    const { data, error } = await serverSupabase
        .from(CHALLENGES_TABLE)
        .insert([challengeData])
        .select()
        .single();

    if (error) {
        logger.error('Supabase error creating challenge:', { error: error.message });
        throw new AppError(`Supabase error creating challenge: ${error.message}`, 500);
    }
    return data;
}


export async function getChallengeById(challengeId) {
    const { data, error } = await serverSupabase
        .from(CHALLENGES_TABLE)
        .select(`
            *,
            questions:questions (id, prompt, type, options, correct_answer) 
        `) 
        .eq('id', challengeId)
        .single();
    
    
    if (error && error.code !== 'PGRST116') { 
        logger.error(`Supabase error fetching challenge ${challengeId}:`, { error: error.message });
        throw new AppError(`Supabase error fetching challenge: ${error.message}`, 500);
    }
    return data;
}



export async function getAllChallenges() {
    const { data, error } = await serverSupabase
        .from(CHALLENGES_TABLE)
        .select('id, title, description, difficulty, required_xp, created_at')
        .order('difficulty', { ascending: true });

    if (error) {
        logger.error('Supabase error fetching all challenges:', { error: error.message });
        throw new AppError(`Supabase error fetching all challenges: ${error.message}`, 500);
    }
    return data || [];
}


export async function updateChallenge(challengeId, updates) {
    const { data, error } = await serverSupabase
        .from(CHALLENGES_TABLE)
        .update(updates)
        .eq('id', challengeId)
        .select()
        .single();

    if (error) {
        logger.error(`Supabase error updating challenge ${challengeId}:`, { error: error.message });
        throw new AppError(`Supabase error updating challenge: ${error.message}`, 500);
    }
    return data;
}


export async function deleteChallenge(challengeId) {
    const { error, count } = await serverSupabase
        .from(CHALLENGES_TABLE)
        .delete({ count: 'exact' })
        .eq('id', challengeId);

    if (error) {
        logger.error(`Supabase error deleting challenge ${challengeId}:`, { error: error.message });
        throw new AppError(`Supabase error deleting challenge: ${error.message}`, 500);
    }
    return count > 0;
}

export async function submitChallengeAttempt(userId, challengeId, scorePercentage) {
    
    const isSuccessful = scorePercentage >= 70; 
    const xpEarned = isSuccessful ? (XP_PER_CHALLENGE + Math.floor(scorePercentage / 10)) : 0;
    
    
    const { data: attempt, error: attemptError } = await serverSupabase
        .from(USER_ATTEMPTS_TABLE)
        .insert([{
            user_id: userId,
            challenge_id: challengeId,
            score: scorePercentage,
            successful: isSuccessful,
            xp_awarded: xpEarned,
            attempted_at: new Date().toISOString()
        }])
        .select()
        .single();

    if (attemptError) {
        logger.error('Supabase error recording challenge attempt:', { error: attemptError.message });
        throw new AppError(`Supabase error recording attempt: ${attemptError.message}`, 500);
    }

    let updatedProfile = {};
    if (isSuccessful) {
        
        const { data: profileData, error: profileError } = await serverSupabase.rpc('increment_xp', { 
            user_id_input: userId, 
            xp_amount: xpEarned 
        });
        
        if (profileError) {
           
            logger.warn(`XP update failed for user ${userId}: ${profileError.message}`);
        }
        
        updatedProfile = profileData || {};
    }

    return {
        attempt,
        isSuccessful,
        xp: updatedProfile.current_xp || null,
        streak: updatedProfile.streak_days || null,
        xpEarned: xpEarned
    };
}



