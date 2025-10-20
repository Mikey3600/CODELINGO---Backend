import { supabase } from '../config/supabaseClient.js';

const DSA_PROBLEMS_TABLE = 'dsa_problems';

// Create a new problem
export async function createProblem(problem) {
  // problem: { externalId, source, title, difficulty, tags, url, languageSupport, ... }
  const { data, error } = await supabase
    .from(DSA_PROBLEMS_TABLE)
    .upsert(problem, { onConflict: 'externalId' })
    .single();
  if (error) throw error;
  return data;
}

// Get all problems
export async function getAllProblems() {
  const { data, error } = await supabase
    .from(DSA_PROBLEMS_TABLE)
    .select('*')
    .order('difficulty', { ascending: true });
  if (error) throw error;
  return data;
}

// Get problem by ID
export async function getProblemById(id) {
  const { data, error } = await supabase
    .from(DSA_PROBLEMS_TABLE)
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

// Update problem by ID
export async function updateProblem(id, updates) {
  const { data, error } = await supabase
    .from(DSA_PROBLEMS_TABLE)
    .update(updates)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

// Delete problem by ID
export async function deleteProblem(id) {
  const { data, error } = await supabase
    .from(DSA_PROBLEMS_TABLE)
    .delete()
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

// Optional: Sync problems from an external source (e.g., LeetCode API, etc.)
export async function syncProblemsFromSource() {
  try {
    // Example placeholder logic
    // In real implementation, fetch problems from external APIs
    const dummyProblems = [
      { title: 'Two Sum', difficulty: 'Easy', source: 'LeetCode' },
      { title: 'Merge Intervals', difficulty: 'Medium', source: 'LeetCode' },
    ];

    const { data, error } = await supabase
      .from(DSA_PROBLEMS_TABLE)
      .upsert(dummyProblems);
    if (error) throw error;

    return { inserted: data.length };
  } catch (err) {
    throw new Error('Failed to sync problems: ' + err.message);
  }
}
