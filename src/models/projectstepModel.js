import { supabase } from '../config/supabaseClient.js';

const PROJECTS_TABLE = 'projects'; // make sure you have a 'projects' table in Supabase

// Create a new project
export async function createProject(project) {
  // project: { title, description, category, ... }
  const { data, error } = await supabase.from(PROJECTS_TABLE).insert([project]).single();
  if (error) throw error;
  return data;
}

// Get all projects
export async function getAllProjects() {
  const { data, error } = await supabase.from(PROJECTS_TABLE).select('*');
  if (error) throw error;
  return data;
}

// Get a project by ID
export async function getProjectById(id) {
  const { data, error } = await supabase.from(PROJECTS_TABLE).select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

// Update project
export async function updateProject(id, updates) {
  const { data, error } = await supabase.from(PROJECTS_TABLE).update(updates).eq('id', id).single();
  if (error) throw error;
  return data;
}

// Delete project
export async function deleteProject(id) {
  const { data, error } = await supabase.from(PROJECTS_TABLE).delete().eq('id', id).single();
  if (error) throw error;
  return data;
}

