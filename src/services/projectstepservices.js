import { serverSupabase } from '../utils/supabaseClient.js';

const PROJECTS_TABLE = 'user_projects';


const safeParse = (data, field) => {
    try {
        
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
            
            
            steps: JSON.stringify(projectData.steps || []), 
            user_id: projectData.user_id,
        }])
        .select()
        .single();

    if (error) throw new Error(`Supabase error creating project: ${error.message}`);
    
    
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

   
    if (error && error.code !== 'PGRST116') {
        throw new Error(`Supabase error fetching project: ${error.message}`);
    }
    
    if (data) {
       
        data.steps = safeParse(data, 'steps');
    }
    return data;
}


export async function getAllProjects() {
    
    
    const { data, error } = await serverSupabase
        .from(PROJECTS_TABLE)
        .select('id, title, description, created_at, user_id'); 

    if (error) throw new Error(`Supabase error fetching all projects: ${error.message}`);
    return data || [];
}


export async function updateProject(projectId, updates) {
    
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
  
    const project = await getProjectById(projectId);

    if (!project) return null;

    let updated = false;
    
    
    const steps = project.steps.map(step => {
        if (step.id === stepId) {
            step.status = status;
            step.updated_at = new Date().toISOString();
            updated = true;
        }
        return step;
    });

    if (!updated) {
    
        return null;
    }

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