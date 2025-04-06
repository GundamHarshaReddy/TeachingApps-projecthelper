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

interface IdeationSaveData {
  id?: string;
  name: string;
  subject?: string;
  interests?: string;
  tools?: string;
  skill_level?: string;
  project_duration?: string;
  target_audience?: string;
  grade?: string;
  detailed_explanation?: string;
  project_domain?: string;
  project_idea?: string;
  project_id?: string | null;
  projectId?: string | null;
}

export async function saveIdeation(data: IdeationSaveData) {
  try {
    const supabase = getSupabaseClient();
    const isNewIdeation = !data.id;
    const ideationId = data.id || uuidv4();
    const project_id = data.project_id || data.projectId;
    const now = new Date().toISOString();
    
    // Prepare data for database
    const ideationData = {
      id: ideationId,
      name: data.name || `Ideation ${now.substring(0, 10)}`,
      project_id: project_id,
      subject: data.subject || '',
      interests: data.interests || '',
      tools: data.tools || '',
      skill_level: data.skill_level || '',
      project_duration: data.project_duration || '',
      target_audience: data.target_audience || '',
      grade: data.grade || '',
      detailed_explanation: data.detailed_explanation || '',
      project_domain: data.project_domain || 'technical',
      project_idea: data.project_idea || '',
      created_at: isNewIdeation ? now : undefined,
      updated_at: now
    };
    
    // Insert or update ideation in database
    const { error } = isNewIdeation
      ? await supabase.from('project_ideations').insert([ideationData])
      : await supabase.from('project_ideations').update(ideationData).eq('id', ideationId);

    if (error) throw new Error(`Failed to save ideation: ${error.message}`);
    
    // Format the response
    return {
      success: true,
      id: ideationId,
      name: ideationData.name,
      message: isNewIdeation ? 'Ideation created successfully' : 'Ideation updated successfully'
    };
    
  } catch (error) {
    console.error('Error saving ideation:', error);
    return {
      success: false,
      message: 'Failed to save ideation'
    };
  }
}

export async function getIdeationHistoryByProjectId(projectId: string) {
  try {
    const supabase = getSupabaseClient();
    
    // Get all ideations for this project
    const { data, error } = await supabase
      .from('project_ideations')
      .select('id, name, subject, project_domain, created_at, updated_at, project_idea')
      .eq('project_id', projectId)
      .order('updated_at', { ascending: false });

    if (error) throw new Error(`Error fetching ideation history: ${error.message}`);
    
    // Format the history items
    return data.map(item => ({
      id: item.id,
      name: item.name,
      subject: item.subject,
      projectDomain: item.project_domain,
      createdAt: item.created_at,
      lastModified: item.updated_at,
      preview: item.project_idea ? item.project_idea.substring(0, 100) + '...' : 'No content'
    }));
  } catch (err) {
    console.error('Error in getIdeationHistoryByProjectId:', err);
    return []; // Return empty array if there's an error
  }
}

export async function getIdeationById(ideationId: string) {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('project_ideations')
      .select('*')
      .eq('id', ideationId)
      .single();

    if (error) throw new Error(`Error fetching ideation: ${error.message}`);

    return {
      id: data.id,
      name: data.name,
      projectId: data.project_id,
      subject: data.subject,
      interests: data.interests,
      tools: data.tools,
      skillLevel: data.skill_level,
      projectDuration: data.project_duration,
      targetAudience: data.target_audience,
      grade: data.grade,
      detailedExplanation: data.detailed_explanation,
      projectDomain: data.project_domain,
      projectIdea: data.project_idea,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (err) {
    console.error('Error in getIdeationById:', err);
    throw err;
  }
}

export async function deleteIdeationById(ideationId: string) {
  try {
    console.log(`[deleteIdeationById] Attempting to delete ideation with ID: ${ideationId}`);
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('project_ideations')
      .delete()
      .eq('id', ideationId);

    if (error) {
      console.error(`[deleteIdeationById] Database error:`, error);
      return false;
    }
    
    console.log(`[deleteIdeationById] Successfully deleted ideation with ID: ${ideationId}`);
    return true;
  } catch (err) {
    console.error('[deleteIdeationById] Error:', err);
    return false;
  }
} 