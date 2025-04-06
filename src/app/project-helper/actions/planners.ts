"use server";

import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase client with error handling
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials are not properly configured');
  }

  return createClient(supabaseUrl, supabaseKey);
}

interface PlannerSaveData {
  id?: string;
  name: string;
  project_name?: string;
  project_description?: string;
  duration?: string;
  grade?: string;
  project_domain?: string;
  project_timeline?: string;
  project_id?: string | null;
  projectId?: string | null;
}

export async function savePlanner(data: PlannerSaveData) {
  try {
    const supabase = getSupabaseClient();
    const isNewPlanner = !data.id;
    const plannerId = data.id || uuidv4();
    const project_id = data.project_id || data.projectId;
    const now = new Date().toISOString();
    
    // Prepare data for database
    const plannerData = {
      id: plannerId,
      name: data.name || `Planner ${now.substring(0, 10)}`,
      project_id: project_id,
      project_name: data.project_name || '',
      project_description: data.project_description || '',
      duration: data.duration || '',
      grade: data.grade || '',
      project_domain: data.project_domain || 'technical',
      project_timeline: data.project_timeline || '',
      created_at: isNewPlanner ? now : undefined,
      updated_at: now
    };
    
    // Insert or update planner in database
    const { error } = isNewPlanner
      ? await supabase.from('project_planners').insert([plannerData])
      : await supabase.from('project_planners').update(plannerData).eq('id', plannerId);

    if (error) throw new Error(`Failed to save planner: ${error.message}`);
    
    // Format the response
    return {
      success: true,
      id: plannerId,
      name: plannerData.name,
      message: isNewPlanner ? 'Planner created successfully' : 'Planner updated successfully'
    };
    
  } catch (error) {
    console.error('Error saving planner:', error);
    return {
      success: false,
      message: 'Failed to save planner'
    };
  }
}

export async function getPlannerHistoryByProjectId(projectId: string) {
  try {
    const supabase = getSupabaseClient();
    
    // Get all planners for this project
    const { data, error } = await supabase
      .from('project_planners')
      .select('id, name, project_name, project_domain, created_at, updated_at, project_timeline')
      .eq('project_id', projectId)
      .order('updated_at', { ascending: false });

    if (error) throw new Error(`Error fetching planner history: ${error.message}`);
    
    // Format the history items
    return data.map(item => ({
      id: item.id,
      name: item.name,
      projectName: item.project_name,
      projectDomain: item.project_domain,
      createdAt: item.created_at,
      lastModified: item.updated_at,
      preview: item.project_timeline ? item.project_timeline.substring(0, 100) + '...' : 'No content'
    }));
  } catch (err) {
    console.error('Error in getPlannerHistoryByProjectId:', err);
    return []; // Return empty array if there's an error
  }
}

export async function getPlannerById(plannerId: string) {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('project_planners')
      .select('*')
      .eq('id', plannerId)
      .single();

    if (error) throw new Error(`Error fetching planner: ${error.message}`);

    return {
      id: data.id,
      name: data.name,
      projectId: data.project_id,
      projectName: data.project_name,
      projectDescription: data.project_description,
      duration: data.duration,
      grade: data.grade,
      projectDomain: data.project_domain,
      projectTimeline: data.project_timeline,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (err) {
    console.error('Error in getPlannerById:', err);
    throw err;
  }
}

export async function deletePlannerById(plannerId: string) {
  try {
    console.log(`[deletePlannerById] Attempting to delete planner with ID: ${plannerId}`);
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('project_planners')
      .delete()
      .eq('id', plannerId);

    if (error) {
      console.error(`[deletePlannerById] Database error:`, error);
      return false;
    }
    
    console.log(`[deletePlannerById] Successfully deleted planner with ID: ${plannerId}`);
    return true;
  } catch (err) {
    console.error('[deletePlannerById] Error:', err);
    return false;
  }
} 