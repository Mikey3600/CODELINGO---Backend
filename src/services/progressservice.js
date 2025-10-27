import { serverSupabase } from '../utils/supabaseClient.js';
import profileService from './profileService.js'; 

const USER_PROGRESS_TABLE = 'user_progress';

const XP_PER_LESSON = 10; 


export async function getLessonProgress(userId, lessonId) {
    try {
        const { data, error } = await serverSupabase
            .from(USER_PROGRESS_TABLE)
            .select('*')
            .eq('user_id', userId)
            .eq('lesson_id', lessonId)
            .single();

        
        if (error && error.code !== 'PGRST116') { 
            console.error('[ProgressService] Error fetching progress:', error);
            throw new Error('Database error retrieving lesson progress.');
        }

        return data; 

    } catch (error) {
        console.error(`[ProgressService] Unexpected error in getLessonProgress: ${error.message}`);
        throw new Error('Internal server error during progress fetch.');
    }
}


export async function saveLessonProgress(userId, lessonId, score) {
    if (!userId || !lessonId || typeof score !== 'number') {
        throw new Error('User ID, Lesson ID, and Score are required.');
    }

    const progressData = {
        user_id: userId,
        lesson_id: lessonId,
        score: score,
        attempts: 1, 
        completion_date: new Date().toISOString(),
    };

    try {
        
        const { data, error } = await serverSupabase
            .from(USER_PROGRESS_TABLE)
            .upsert(progressData, {
                onConflict: ['user_id', 'lesson_id'], 
                ignoreDuplicates: false,
            })
            .select('*')
            .single();

        if (error) {
            console.error('[ProgressService] Error saving progress:', error);
            throw new Error('Database error saving lesson progress.');
        }
        
      

        return data;

    } catch (error) {
        console.error(`[ProgressService] Unexpected error in saveLessonProgress: ${error.message}`);
        throw new Error('Internal server error during progress save.');
    }
}


export async function getLeaderboard(limit = 10) {
    try {
        
        const { data: profileData, error } = await serverSupabase
            .from('user_profile')
            .select('id, username, xp, streak')
            .order('xp', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('[ProgressService] Error fetching leaderboard:', error);
            throw new Error('Database error retrieving leaderboard.');
        }

        
        return profileData.map(p => ({
            userId: p.id,
            username: p.username,
            xp: p.xp,
            streak: p.streak,
        })) || [];

    } catch (error) {
        console.error(`[ProgressService] Unexpected error in getLeaderboard: ${error.message}`);
        throw new Error('Internal server error during leaderboard fetch.');
    }
}

export default {
    getLessonProgress,
    saveLessonProgress,
    getLeaderboard,
};
