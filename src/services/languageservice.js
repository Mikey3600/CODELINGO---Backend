import { serverSupabase } from '../utils/supabaseClient.js';
import AppError from '../utils/apperror.js';

const LANGUAGE_TABLE = 'languages';


export const getAllLanguages = async () => {
    const { data, error } = await serverSupabase
        .from(LANGUAGE_TABLE)
        .select('id, name, slug, description, icon_url')
        .order('name', { ascending: true });

    if (error) {
        throw new AppError(`Database error fetching languages: ${error.message}`, 500);
    }

    return data || [];
};


export const getLanguageBySlug = async (slug) => {
    const { data, error } = await serverSupabase
        .from(LANGUAGE_TABLE)
        .select('id, name, slug, description, icon_url, lesson_count')
        .eq('slug', slug)
        .single();

    if (error && error.code !== 'PGRST116') { 
        throw new AppError(`Database error fetching language ${slug}: ${error.message}`, 500);
    }

    if (!data) {
        throw new AppError(`Language with slug '${slug}' not found.`, 404);
    }

    return data;
};


export const createLanguage = async (languageData) => {
  
    if (!languageData.name || !languageData.slug) {
        throw new AppError('Language name and slug are required fields.', 400);
    }

    const { data, error } = await serverSupabase
        .from(LANGUAGE_TABLE)
        .insert([languageData])
        .select()
        .single();

    if (error) {

        if (error.code === '23505') {
            throw new AppError(`A language with slug '${languageData.slug}' already exists.`, 409);
        }
        throw new AppError(`Database error creating language: ${error.message}`, 500);
    }

    return data;
};
