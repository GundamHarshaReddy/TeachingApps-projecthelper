"use server";

import { createClient } from "../lib/supabase/server";
import { v4 as uuidv4 } from "uuid";

interface ProjectFormData {
  projectName: string;
  grade: string;
  projectDomain: string;
  description: string;
}

export async function createProjectInDB(data: ProjectFormData): Promise<string> {
  try {
    const supabase = await createClient();
    
    // Generate a unique ID for the project
    const projectId = uuidv4();
    
    // Insert the project data into the 'projects' table
    // Use a placeholder user_id for development or retrieve it from auth if available
    const { error } = await supabase
      .from('projects')
      .insert({
        id: projectId,
        name: data.projectName,
        grade: data.grade,
        domain: data.projectDomain,
        description: data.description,
        user_id: '00000000-0000-0000-0000-000000000000' // Placeholder user_id for development
      });
    
    if (error) {
      console.error("Error inserting project:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    return projectId;
  } catch (err) {
    console.error("Error in createProjectInDB:", err);
    throw err;
  }
}

export async function getProjectById(projectId: string) {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) {
      console.error("Error fetching project:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error in getProjectById:", error);
    throw error;
  }
} 