import { serverSupabase } from '../utils/supabaseClient.js';

const PROJECTS_TABLE = 'user_projects';


const safeParse = (data, field) => {
    try {
        // Ensure data[field] is treated as a string before parsing
        const jsonString = typeof data[field] === 'string' ? data[field] : JSON.stringify(data[field]);
        return JSON.parse(jsonString);
    } catch (e) {
        console.error(`Error parsing JSON field ${field} for project ${data.id}:`, e);
        return [];
    }
};


export async function createProject(projectData) {
    const { data, error } = await serverSupabase
        .from(PROJECTS_TABLE)
        .insert([{
            ...projectData,
            
            // Ensure array fields like steps are correctly stringified for storage
            steps: JSON.stringify(projectData.steps || []), 
            user_id: projectData.user_id,
        }])
        .select()
        .single();

    if (error) throw new Error(`Supabase error creating project: ${error.message}`);
    
    // Parse steps back before returning, if data is valid
    if (data) {
        data.steps = safeParse(data, 'steps');
    }
    return data;
}


export async function getProjectById(projectId) {
    const { data, error } = await serverSupabase
        .from(PROJECTS_TABLE)
        .select('*')
        .eq('id', projectId)
        .single();

    // PGRST116 means 'no rows found', which is acceptable for single()
    if (error && error.code !== 'PGRST116') {
        throw new Error(`Supabase error fetching project: ${error.message}`);
    }
    
    if (data) {
        // Parse the stored JSON string back into an array/object
        data.steps = safeParse(data, 'steps');
    }
    return data;
}


export async function getAllProjects() {
    
    // Note: 'steps' is deliberately excluded for performance when fetching all projects
    const { data, error } = await serverSupabase
        .from(PROJECTS_TABLE)
        .select('id, title, description, created_at, user_id'); 

    if (error) throw new Error(`Supabase error fetching all projects: ${error.message}`);
    return data || [];
}


export async function updateProject(projectId, updates) {
    // Stringify steps if they are being updated
    if (updates.steps) {
        updates.steps = JSON.stringify(updates.steps);
    }
    
    const { data, error } = await serverSupabase
        .from(PROJECTS_TABLE)
        .update(updates)
        .eq('id', projectId)
        .select()
        .single();

    if (error) throw new Error(`Supabase error updating project: ${error.message}`);
    
    if (data) {
        // Parse steps back before returning
        data.steps = safeParse(data, 'steps');
    }
    return data;
}


export async function deleteProject(projectId) {
    const { error, count } = await serverSupabase
        .from(PROJECTS_TABLE)
        .delete({ count: 'exact' })
        .eq('id', projectId);

    if (error) throw new Error(`Supabase error deleting project: ${error.message}`);
    return count > 0;
}


export async function updateProjectStep(projectId, stepId, status) {
    // 1. Get the current project data
    const project = await getProjectById(projectId);

    if (!project) return null;

    let updated = false;
    
    // 2. Update the specific step in the local steps array
    const steps = project.steps.map(step => {
        if (step.id === stepId) {
            step.status = status;
            step.updated_at = new Date().toISOString();
            updated = true;
        }
        return step;
    });

    if (!updated) {
        // If the step ID wasn't found, return null
        return null;
    }

    // 3. Update the whole steps column in the database
    const updatedProject = await updateProject(projectId, { steps: steps });

    return updatedProject;
}

export default {
    createProject,
    getProjectById,
    getAllProjects,
    updateProject,
    deleteProject,
    updateProjectStep,
};