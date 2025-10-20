
import { supabase } from '../config/supabaseClient.js';

const LESSONS_TABLE = 'lessons';

export async function createLesson(lesson) {
  // lesson: { title, language, content, order, ... }
  const { data, error } = await supabase.from(LESSONS_TABLE).insert([lesson]).single();
  if (error) throw error;
  return data;
}

export async function getAllLessons(language) {
  const query = supabase.from(LESSONS_TABLE).select('*').order('order', { ascending: true });
  if (language) query.eq('language', language);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getLessonById(id) {
  const { data, error } = await supabase.from(LESSONS_TABLE).select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function updateLesson(id, updates) {
  const { data, error } = await supabase.from(LESSONS_TABLE).update(updates).eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function deleteLesson(id) {
  const { data, error } = await supabase.from(LESSONS_TABLE).delete().eq('id', id).single();
  if (error) throw error;
  return data;
}