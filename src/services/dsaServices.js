import { serverSupabase } from '../utils/supabaseClient.js';
import { generateContent } from './aiService.js'; 
import AppError from '../utils/apperror.js';
import logger from '../utils/logger.js';


const DSA_PROBLEMS_TABLE = 'dsa_problems'; 
const EXTERNAL_SOURCES = ['leetcode', 'hackerank', 'codewars']; 


export async function createProblem(problemData) {
    if (!problemData.external_id || !problemData.title || !problemData.source) {
        throw new AppError('Problem requires an external ID, title, and source.', 400);
    }
    
    
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


export async function getProblemById(problemId) {
    const { data, error } = await serverSupabase
        .from(DSA_PROBLEMS_TABLE)
        .select('*')
        .eq('id', problemId)
        .single();

    if (error && error.code !== 'PGRST116') { 
        logger.error(`Database error fetching DSA problem ${problemId}:`, { error: error.message });
        throw new AppError(`Database error fetching problem: ${error.message}`, 500);
    }
    return data;
}


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


export async function syncProblemsFromSource(source = 'all') {
    let syncedCount = 0;
    let failedCount = 0;
    const sourcesToSync = source === 'all' ? EXTERNAL_SOURCES : [source];

    logger.info(`Starting sync operation for sources: ${sourcesToSync.join(', ')}`);

    for (const src of sourcesToSync) {
        logger.info(`Faking retrieval from external source: ${src}...`);
        
        
        const mockProblems = [
            { external_id: `${src}-101`, title: 'Two Sum Variant', source: src, difficulty: 'Easy', description: 'Mock description 1' },
            { external_id: `${src}-102`, title: 'Merge Intervals Optimization', source: src, difficulty: 'Medium', description: 'Mock description 2' },
        ];
        

        for (const problem of mockProblems) {
            try {
                const { data, error } = await serverSupabase
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