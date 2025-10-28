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
            
            
            test_data: JSON.stringify(testData.testData), 
            score: 0,
            finished_at: null,
        }])
        .select()
        .single();

    if (error) throw new Error(`Supabase error creating adaptive test: ${error.message}`);
    return data;
}


export async function getAdaptiveTestById(testId) {
    const { data, error } = await serverSupabase
        .from(TESTS_TABLE)
        .select('*')
        .eq('id', testId)
        .single();

    
    if (error && error.code !== 'PGRST116') {
        throw new Error(`Supabase error fetching adaptive test: ${error.message}`);
    }
    return data;
}


export async function submitAnswer(testId, answerData) {
     
    
    
    const updates = {
        
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


export async function getTestResults(testId) {
    const { data, error } = await serverSupabase
        .from(TESTS_TABLE)
        .select('id, user_id, test_type, score, completed_at, questions_json, difficulty')
        .eq('id', testId)
        .single();


    if (error && error.code !== 'PGRST116') {
        throw new Error(`Supabase error fetching test results: ${error.message}`);
    }
    return data;
}


export async function getAllAdaptiveTests(userId) {
    const { data, error } = await serverSupabase
        .from(TESTS_TABLE)
        .select('id, current_level, score, started_at, finished_at')
        .eq('user_id', userId)
        .order('started_at', { ascending: false });

    if (error) throw new Error(`Supabase error fetching user adaptive tests: ${error.message}`);
    return data || [];
}


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
