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

interface DiagramSaveData {
  id?: string;
  name: string;
  diagramType?: string;
  diagram_type?: string;
  nodes: any[];
  edges: any[];
  project_id?: string | null;
  projectId?: string | null;
  updated_at?: string;
  // New fields for enhanced functionality
  description?: string;
  thumbnail?: string;
}

export async function saveDiagram(data: DiagramSaveData) {
  try {
    const supabase = getSupabaseClient();
    const isNewDiagram = !data.id;
    const diagramId = data.id || uuidv4();
    const project_id = data.project_id || data.projectId;
    const now = new Date().toISOString();
    
    // Prepare data for database
    const diagramData = {
      id: diagramId,
      name: data.name || `Diagram ${now.substring(0, 10)}`,
      project_id: project_id,
      diagram_type: data.diagramType || data.diagram_type || 'custom',
      nodes: data.nodes,
      edges: data.edges,
      description: data.description || '',
      thumbnail: data.thumbnail || '',
      created_at: isNewDiagram ? now : undefined,
      updated_at: now
    };
    
    // Insert or update diagram in database
    const { error } = isNewDiagram
      ? await supabase.from('project_diagrams').insert([diagramData])
      : await supabase.from('project_diagrams').update(diagramData).eq('id', diagramId);

    if (error) throw new Error(`Failed to save diagram: ${error.message}`);
    
    // Format the response
    return {
      success: true,
      id: diagramId,
      name: diagramData.name,
      message: isNewDiagram ? 'Diagram created successfully' : 'Diagram updated successfully'
    };
    
  } catch (error) {
    console.error('Error saving diagram:', error);
    return {
      success: false,
      message: 'Failed to save diagram'
    };
  }
}

export async function getDiagramHistoryByProjectId(projectId: string) {
  try {
    const supabase = getSupabaseClient();
    
    // For development testing, return mock data
    /*
    return [
      {
        id: "diagram-1",
        name: "Initial Diagram",
        diagramType: "flowchart",
        project_id: projectId,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        thumbnail: "/project-helper/diagram-preview-placeholder.png"
      },
      {
        id: "diagram-2",
        name: "Updated Workflow",
        diagramType: "businessCanvas",
        project_id: projectId,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        thumbnail: "/project-helper/diagram-preview-placeholder.png"
      }
    ];
    */
    
    // Get all diagrams for this project
    const { data, error } = await supabase
      .from('project_diagrams')
      .select('id, name, diagram_type, created_at, updated_at, thumbnail, description')
      .eq('project_id', projectId)
      .order('updated_at', { ascending: false });

    if (error) throw new Error(`Error fetching diagram history: ${error.message}`);
    
    // Format the history items
    return data.map(item => ({
      id: item.id,
      name: item.name,
      diagramType: item.diagram_type,
      createdAt: item.created_at,
      lastModified: item.updated_at,
      previewImage: item.thumbnail || '/project-helper/diagram-preview-placeholder.png',
      description: item.description
    }));
  } catch (err) {
    console.error('Error in getDiagramHistoryByProjectId:', err);
    return []; // Return empty array if there's an error
  }
}

export async function getDiagramByProjectId(projectId: string) {
  try {
    // For development/testing, return a mock diagram with no nodes
    // In a production environment, this would query the database
    console.log("Getting diagram for project:", projectId);
    
    // Return empty diagram structure for clean start
    return {
      id: "mock-diagram-" + projectId,
      name: "New Diagram",
      projectId: projectId,
      diagramType: "custom", 
      nodes: [], // Empty nodes array to start with a clean slate
      edges: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Original database query code (commented out for testing)
    /*
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('project_diagrams')
      .select('*')
      .eq('project_id', projectId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // If no diagram found, return null instead of throwing an error
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error fetching diagram: ${error.message}`);
    }

    return {
      id: data.id,
      name: data.name,
      projectId: data.project_id,
      diagramType: data.diagram_type,
      nodes: data.nodes,
      edges: data.edges,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      description: data.description,
      thumbnail: data.thumbnail
    };
    */
  } catch (err) {
    console.error('Error in getDiagramByProjectId:', err);
    return null; // Return null if no diagram or if there's an error
  }
}

export async function getDiagramById(diagramId: string) {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('project_diagrams')
      .select('*')
      .eq('id', diagramId)
      .single();

    if (error) throw new Error(`Error fetching diagram: ${error.message}`);

    return {
      id: data.id,
      name: data.name,
      projectId: data.project_id,
      diagramType: data.diagram_type,
      nodes: data.nodes,
      edges: data.edges,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      description: data.description,
      thumbnail: data.thumbnail
    };
  } catch (err) {
    console.error('Error in getDiagramById:', err);
    throw err;
  }
}

export async function deleteDiagramById(diagramId: string) {
  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('project_diagrams')
      .delete()
      .eq('id', diagramId);

    if (error) throw new Error(`Error deleting diagram: ${error.message}`);
    return true;
  } catch (err) {
    console.error('Error in deleteDiagramById:', err);
    throw err;
  }
}