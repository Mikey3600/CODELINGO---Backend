
import { supabase } from '../config/supabaseClient.js';

const CHALLENGES_TABLE = 'challenges';

export async function createChallenge(challenge) {
  // challenge: { title, language, description, testCases, difficulty, order, ... }
  const { data, error } = await supabase.from(CHALLENGES_TABLE).insert([challenge]).single();
  if (error) throw error;
  return data;
}

export async function getChallengesByLanguage(language) {
  const { data, error } = await supabase
    .from(CHALLENGES_TABLE)
    .select('*')
    .eq('language', language)
    .order('order', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getChallengeById(id) {
  const { data, error } = await supabase.from(CHALLENGES_TABLE).select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function updateChallenge(id, updates) {
  const { data, error } = await supabase.from(CHALLENGES_TABLE).update(updates).eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function deleteChallenge(id) {
  const { data, error } = await supabase.from(CHALLENGES_TABLE).delete().eq('id', id).single();
  if (error) throw error;
  return data;
}