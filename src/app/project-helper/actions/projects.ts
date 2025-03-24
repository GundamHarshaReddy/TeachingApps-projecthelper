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
    const { error } = await supabase
      .from('projects')
      .insert({
        id: projectId,
        name: data.projectName,
        grade: data.grade,
        domain: data.projectDomain,
        description: data.description,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error("Error inserting project:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    return projectId;
  } catch (error) {
    console.error("Error in createProjectInDB:", error);
    throw error;
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