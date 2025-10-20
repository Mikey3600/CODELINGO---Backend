
import { supabase } from '../config/supabaseClient.js';

const USERS_TABLE = 'users';

export async function createUser(user) {
  // user: { id, email, username, hashed_password, ... }
  const { data, error } = await supabase.from(USERS_TABLE).insert([user]).single();
  if (error) throw error;
  return data;
}

export async function getUserByEmail(email) {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select('*')
    .eq('email', email)
    .single();
  if (error) throw error;
  return data;
}

export async function getUserById(id) {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function updateUser(id, updates) {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .update(updates)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteUser(id) {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .delete()
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}