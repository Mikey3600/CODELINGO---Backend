import { serverSupabase } from '../utils/supabaseClient.js';
import { generateContent } from './aiService.js'; // Needed if problems are AI-generated
import AppError from '../utils/apperror.js';
import logger from '../config/logger.js';

// --- Database Table Constants ---
// NOTE: We assume a 'dsa_problems' table exists for the problem catalog, separate from user tracking.
const DSA_PROBLEMS_TABLE = 'dsa_problems'; 
const EXTERNAL_SOURCES = ['leetcode', 'hackerank', 'codewars']; // Mock external sources

/**
 * @function createProblem
 * @description Inserts a new DSA problem into the database (Admin function).
 * @param {object} problemData - Object containing problem details.
 * @returns {Promise<object>} The newly created problem object.
 */
export async function createProblem(problemData) {
    if (!problemData.external_id || !problemData.title || !problemData.source) {
        throw new AppError('Problem requires an external ID, title, and source.', 400);
    }
    
    // NOTE: Requires RLS policies to allow creation
    const { data, error } = await serverSupabase
        .from(DSA_PROBLEMS_TABLE)
        .insert([problemData])
        .select()
        .single();

    if (error) {
        logger.error('Database error creating DSA problem:', { error: error.message });
        throw new AppError(`Database error creating problem: ${error.message}`, 500);
    }
    return data;
}

/**
 * @function getProblemById
 * @description Retrieves a single DSA problem by its primary key ID.
 * @param {string} problemId - The UUID of the problem.
 * @returns {Promise<object|null>} The problem object or null if not found.
 */
export async function getProblemById(problemId) {
    const { data, error } = await serverSupabase
        .from(DSA_PROBLEMS_TABLE)
        .select('*')
        .eq('id', problemId)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means 'No rows found'
        logger.error(`Database error fetching DSA problem ${problemId}:`, { error: error.message });
        throw new AppError(`Database error fetching problem: ${error.message}`, 500);
    }
    return data;
}

/**
 * @function getAllProblems
 * @description Retrieves a summary list of all DSA problems in the catalog.
 * @returns {Promise<Array>} List of all problems.
 */
export async function getAllProblems() {
    const { data, error } = await serverSupabase
        .from(DSA_PROBLEMS_TABLE)
        .select('id, title, source, difficulty, external_id')
        .order('difficulty', { ascending: true });

    if (error) {
        logger.error('Database error fetching all DSA problems:', { error: error.message });
        throw new AppError(`Database error fetching all problems: ${error.message}`, 500);
    }
    return data || [];
}

/**
 * @function updateProblem
 * @description Updates an existing DSA problem.
 * @param {string} problemId - The UUID of the problem to update.
 * @param {object} updates - Key-value pairs of fields to update.
 * @returns {Promise<object|null>} The updated problem object or null if not found.
 */
export async function updateProblem(problemId, updates) {
    const { data, error } = await serverSupabase
        .from(DSA_PROBLEMS_TABLE)
        .update(updates)
        .eq('id', problemId)
        .select()
        .single();

    if (error) {
        logger.error(`Database error updating DSA problem ${problemId}:`, { error: error.message });
        throw new AppError(`Database error updating problem: ${error.message}`, 500);
    }
    return data;
}

/**
 * @function deleteProblem
 * @description Deletes a DSA problem by its ID.
 * @param {string} problemId - The UUID of the problem.
 * @returns {Promise<boolean>} True if deleted, false if not found.
 */
export async function deleteProblem(problemId) {
    const { error, count } = await serverSupabase
        .from(DSA_PROBLEMS_TABLE)
        .delete({ count: 'exact' })
        .eq('id', problemId);

    if (error) {
        logger.error(`Database error deleting DSA problem ${problemId}:`, { error: error.message });
        throw new AppError(`Database error deleting problem: ${error.message}`, 500);
    }
    return count > 0;
}

/**
 * @function syncProblemsFromSource
 * @description Synchronizes problems from a mocked external source or AI generator.
 * NOTE: This is a placeholder for a complex external API integration.
 * @param {string} source - The source name to sync from (e.g., 'leetcode').
 * @returns {Promise<object>} Summary of the sync operation.
 */
export async function syncProblemsFromSource(source = 'all') {
    let syncedCount = 0;
    let failedCount = 0;
    const sourcesToSync = source === 'all' ? EXTERNAL_SOURCES : [source];

    logger.info(`Starting sync operation for sources: ${sourcesToSync.join(', ')}`);

    for (const src of sourcesToSync) {
        logger.info(`Faking retrieval from external source: ${src}...`);
        
        // --- Mock External Fetch ---
        // In a real application, this would be an API call to LeetCode/HackerRank, etc.
        const mockProblems = [
            { external_id: `${src}-101`, title: 'Two Sum Variant', source: src, difficulty: 'Easy', description: 'Mock description 1' },
            { external_id: `${src}-102`, title: 'Merge Intervals Optimization', source: src, difficulty: 'Medium', description: 'Mock description 2' },
        ];
        // --- End Mock ---

        for (const problem of mockProblems) {
            try {
                // Upsert logic: Insert if external_id/source combination is new, update otherwise.
                const { data, error } = await serverSupabase
                    .from(DSA_PROBLEMS_TABLE)
                    .upsert(
                        {
                            ...problem,
                            updated_at: new Date().toISOString()
                        }, 
                        { 
                            onConflict: 'external_id, source' 
                        }
                    )
                    .select()
                    .single();

                if (error) {
                    logger.error(`Failed to upsert problem ${problem.external_id} from ${src}: ${error.message}`);
                    failedCount++;
                } else {
                    syncedCount++;
                }
            } catch (e) {
                logger.error(`Critical error during upsert for ${src}: ${e.message}`);
                failedCount++;
            }
        }
    }

    if (failedCount > 0) {
        throw new AppError(`Sync completed with ${syncedCount} successful problems but ${failedCount} failures.`, 500);
    }

    return { 
        syncedCount, 
        failedCount,
        message: `Successfully synchronized ${syncedCount} problems from ${sourcesToSync.join(', ')}.`
    };
}