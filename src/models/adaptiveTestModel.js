import { supabase } from '../config/supabaseClient.js';

const ADAPTIVE_TESTS_TABLE = 'adaptive_tests';

// 🔹 Create a new adaptive test
export async function createAdaptiveTest(test) {
  // test: { userId, testData, currentLevel, score, startedAt, finishedAt, ... }
  const { data, error } = await supabase
    .from(ADAPTIVE_TESTS_TABLE)
    .insert([test])
    .single();

  if (error) throw error;
  return data;
}

// 🔹 Get all adaptive tests
export async function getAllAdaptiveTests() {
  const { data, error } = await supabase
    .from(ADAPTIVE_TESTS_TABLE)
    .select('*')
    .order('startedAt', { ascending: false });

  if (error) throw error;
  return data;
}

// 🔹 Get a specific test by ID
export async function getAdaptiveTestById(id) {
  const { data, error } = await supabase
    .from(ADAPTIVE_TESTS_TABLE)
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// 🔹 Get tests for a specific user
export async function getAdaptiveTestsByUser(userId) {
  const { data, error } = await supabase
    .from(ADAPTIVE_TESTS_TABLE)
    .select('*')
    .eq('userId', userId)
    .order('startedAt', { ascending: false });

  if (error) throw error;
  return data;
}

// 🔹 Update an adaptive test
export async function updateAdaptiveTest(id, updates) {
  const { data, error } = await supabase
    .from(ADAPTIVE_TESTS_TABLE)
    .update(updates)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// 🔹 Delete an adaptive test
export async function deleteAdaptiveTest(id) {
  const { data, error } = await supabase
    .from(ADAPTIVE_TESTS_TABLE)
    .delete()
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// 🔹 Submit an answer (example logic — adaptive scoring)
export async function submitAnswer(testId, answer) {
  // Fetch test first
  const test = await getAdaptiveTestById(testId);

  if (!test) throw new Error('Test not found');

  // Example logic (you can expand this)
  const correct = Math.random() > 0.5; // placeholder
  const scoreChange = correct ? 10 : -5;
  const newScore = (test.score || 0) + scoreChange;

  // Update test in DB
  const { data, error } = await supabase
    .from(ADAPTIVE_TESTS_TABLE)
    .update({
      score: newScore,
      currentLevel: correct
        ? (test.currentLevel || 1) + 1
        : Math.max(1, (test.currentLevel || 1) - 1),
    })
    .eq('id', testId)
    .single();

  if (error) throw error;
  return {
    correct,
    newScore,
    currentLevel: data.currentLevel,
  };
}

// 🔹 Get test results (summary)
export async function getTestResults(testId) {
  const test = await getAdaptiveTestById(testId);
  if (!test) throw new Error('Test not found');

  return {
    userId: test.userId,
    totalScore: test.score,
    levelReached: test.currentLevel,
    duration:
      test.startedAt && test.finishedAt
        ? (new Date(test.finishedAt) - new Date(test.startedAt)) / 1000
        : null,
  };
}
