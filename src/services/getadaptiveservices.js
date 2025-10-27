import { serverSupabase } from '../utils/supabaseClient.js';

const TESTS_TABLE = 'adaptive_tests';
const RESULTS_TABLE = 'user_test_results'; 

export async function createAdaptiveTest(testData) {
    const { data, error } = await serverSupabase
        .from(TESTS_TABLE)
        .insert([{
            user_id: testData.userId,
            current_level: testData.currentLevel || 1,
            started_at: testData.startedAt,
            
            // IMPORTANT: Ensure testData.testData is stringified if it's a complex object/array
            test_data: JSON.stringify(testData.testData), 
            score: 0,
            finished_at: null,
        }])
        .select()
        .single();

    if (error) throw new Error(`Supabase error creating adaptive test: ${error.message}`);
    return data;
}

/**
 * Fetches a single adaptive test session by its ID.
 * @param {number} testId - The ID of the test session.
 * @returns {Promise<object|null>} The test record or null if not found.
 */
export async function getAdaptiveTestById(testId) {
    const { data, error } = await serverSupabase
        .from(TESTS_TABLE)
        .select('*')
        .eq('id', testId)
        .single();

    // PGRST116 is the error code for "no rows found"
    if (error && error.code !== 'PGRST116') {
        throw new Error(`Supabase error fetching adaptive test: ${error.message}`);
    }
    return data;
}

/**
 * Submits and records a single answer for a specific question within a test session.
 * In a real adaptive test, this function would update the question_json 
 * with the user's answer and the resulting difficulty/level adjustment.
 * @param {string} testId - The ID of the active test session.
 * @param {object} answerData - Contains question_id, user_answer, and if it was correct.
 * @returns {Promise<object>} The updated test record.
 */
export async function submitAnswer(testId, answerData) {
    // NOTE: This implementation performs a simple update. In a full system, 
    // you would typically fetch the existing test, modify the JSONB array 
    // containing the questions/results, and then update the entire row.
    
    // For now, we'll mock the update to update the level.
    const updates = {
        // Placeholder update: we assume a controller will calculate the next level
        current_level: answerData.newLevel, 
    };

    const { data, error } = await serverSupabase
        .from(TESTS_TABLE)
        .update(updates)
        .eq('id', testId)
        .select()
        .single();

    if (error) throw new Error(`Supabase error submitting answer: ${error.message}`);
    return data;
}

/**
 * Fetches the results of a completed adaptive test session by its ID.
 * This is the function required by the adaptiveTestroute.
 * @param {string} testId - The ID of the test session.
 * @returns {Promise<object|null>} The test record, including the final score and questions.
 */
export async function getTestResults(testId) {
    const { data, error } = await serverSupabase
        .from(TESTS_TABLE)
        .select('id, user_id, test_type, score, completed_at, questions_json, difficulty')
        .eq('id', testId)
        .single();

    // PGRST116 is the error code for "no rows found"
    if (error && error.code !== 'PGRST116') {
        throw new Error(`Supabase error fetching test results: ${error.message}`);
    }
    return data;
}

/**
 * Fetches all adaptive test sessions for a specific user.
 * NOTE: Renamed from getAdaptiveTestsByUser to match the route's expected import.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Array<object>>} A list of the user's test records.
 */
export async function getAllAdaptiveTests(userId) {
    const { data, error } = await serverSupabase
        .from(TESTS_TABLE)
        .select('id, current_level, score, started_at, finished_at')
        .eq('user_id', userId)
        .order('started_at', { ascending: false });

    if (error) throw new Error(`Supabase error fetching user adaptive tests: ${error.message}`);
    return data || [];
}

/**
 * Updates an existing adaptive test session record.
 * @param {number} testId - The ID of the test session.
 * @param {object} updates - An object containing the fields to update.
 * @returns {Promise<object>} The updated test record.
 */
export async function updateAdaptiveTest(testId, updates) {
    
    const { data, error } = await serverSupabase
        .from(TESTS_TABLE)
        .update(updates)
        .eq('id', testId)
        .select()
        .single();

    if (error) throw new Error(`Supabase error updating adaptive test: ${error.message}`);
    return data;
}

/**
 * Deletes an adaptive test session record.
 * @param {number} testId - The ID of the test session to delete.
 * @returns {Promise<boolean>} True on successful deletion.
 */
export async function deleteAdaptiveTest(testId) {
    const { error } = await serverSupabase
        .from(TESTS_TABLE)
        .delete()
        .eq('id', testId);

    if (error) throw new Error(`Supabase error deleting adaptive test: ${error.message}`);
    
    return true; 
}

export default {
    createAdaptiveTest,
    getAdaptiveTestById,
    submitAnswer,
    getTestResults, 
    getAllAdaptiveTests,
    updateAdaptiveTest,
    deleteAdaptiveTest,
};
