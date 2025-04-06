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
    console.log('[saveDiagram] Starting with data:', {
      id: data.id,
      name: data.name,
      nodeCount: data.nodes.length,
      edgeCount: data.edges.length,
      projectId: data.project_id || data.projectId
    });
    
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
    console.error('[saveDiagram] Error:', error);
    return {
      success: false,
      message: 'Failed to save diagram'
    };
  }
}

export async function getDiagramHistoryByProjectId(projectId: string) {
  try {
    console.log(`[getDiagramHistoryByProjectId] Starting for project: ${projectId}`);
    const supabase = getSupabaseClient();
    
    // Check Supabase environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    console.log(`[getDiagramHistoryByProjectId] Using Supabase URL: ${supabaseUrl?.substring(0, 20)}...`);
    console.log(`[getDiagramHistoryByProjectId] Has service role key: ${!!process.env.SUPABASE_SERVICE_ROLE_KEY}`);
    console.log(`[getDiagramHistoryByProjectId] Has anon key: ${!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`);
    
    console.log(`[getDiagramHistoryByProjectId] Querying 'project_diagrams' table...`);
    
    // Get all diagrams for this project
    const { data, error } = await supabase
      .from('project_diagrams')
      .select('id, name, diagram_type, created_at, updated_at, thumbnail, description')
      .eq('project_id', projectId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error(`[getDiagramHistoryByProjectId] Database error:`, error);
      throw new Error(`Error fetching diagram history: ${error.message}`);
    }
    
    console.log(`[getDiagramHistoryByProjectId] Retrieved ${data?.length || 0} diagrams`);
    
    // Format the history items
    return data.map(item => ({
      id: item.id,
      name: item.name,
      diagramType: item.diagram_type,
      createdAt: item.created_at,
      lastModified: item.updated_at,
      description: item.description
    }));
  } catch (err) {
    console.error('[getDiagramHistoryByProjectId] Error:', err);
    return []; // Return empty array if there's an error
  }
}

export async function getDiagramByProjectId(projectId: string) {
  try {
    console.log("Getting diagram for project:", projectId);
    
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
  } catch (err) {
    console.error('Error in getDiagramByProjectId:', err);
    return null; // Return null if no diagram or if there's an error
  }
}

export async function getDiagramById(diagramId: string) {
  try {
    console.log(`[getDiagramById] Querying database for diagram ID: ${diagramId}`);
    
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('project_diagrams')
      .select('*')
      .eq('id', diagramId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.error(`No diagram found with ID: ${diagramId}`);
        return null;
      }
      throw new Error(`Error fetching diagram: ${error.message}`);
    }
    
    if (!data) {
      console.error(`No data returned for diagram ID: ${diagramId}`);
      return null;
    }

    console.log(`Found diagram: ${data.name} (nodes: ${data.nodes?.length || 0}, edges: ${data.edges?.length || 0})`);
    
    return {
      id: data.id,
      name: data.name,
      projectId: data.project_id,
      diagramType: data.diagram_type,
      nodes: data.nodes || [],
      edges: data.edges || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      description: data.description,
      thumbnail: data.thumbnail
    };
  } catch (err) {
    console.error('[getDiagramById] Error:', err);
    return null; // Return null instead of throwing
  }
}

export async function deleteDiagramById(diagramId: string) {
  try {
    console.log(`[deleteDiagramById] Attempting to delete diagram with ID: ${diagramId}`);
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('project_diagrams')
      .delete()
      .eq('id', diagramId);

    if (error) {
      console.error(`[deleteDiagramById] Database error:`, error);
      return false;
    }
    
    console.log(`[deleteDiagramById] Successfully deleted diagram with ID: ${diagramId}`);
    return true;
  } catch (err) {
    console.error('[deleteDiagramById] Error:', err);
    return false;
  }
}