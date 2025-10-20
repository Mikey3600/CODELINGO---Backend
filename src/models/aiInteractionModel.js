
import { supabase } from '../config/supabaseClient.js';

const AI_INTERACTIONS_TABLE = 'ai_interactions';

export async function createAIInteraction(interaction) {
  // interaction: { userId, prompt, response, createdAt, metadata }
  const { data, error } = await supabase.from(AI_INTERACTIONS_TABLE).insert([interaction]).single();
  if (error) throw error;
  return data;
}

export async function getAIInteractionsByUser(userId, limit = 50) {
  const { data, error } = await supabase
    .from(AI_INTERACTIONS_TABLE)
    .select('*')
    .eq('userId', userId)
    .order('createdAt', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getAIInteractionById(id) {
  const { data, error } = await supabase.from(AI_INTERACTIONS_TABLE).select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function updateAIInteraction(id, updates) {
  const { data, error } = await supabase.from(AI_INTERACTIONS_TABLE).update(updates).eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function deleteAIInteraction(id) {
  const { data, error } = await supabase.from(AI_INTERACTIONS_TABLE).delete().eq('id', id).single();
  if (error) throw error;
  return data;
}