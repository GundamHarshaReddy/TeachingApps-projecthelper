"use server";

import { createClient } from "../lib/supabase/server";
import { v4 as uuidv4 } from "uuid";
import { DiagramData } from "../types";

// Get diagram for a project
export async function getDiagramByProjectId(projectId: string, diagramType: string = 'business-model-canvas') {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('project_diagrams')
      .select('*')
      .eq('project_id', projectId)
      .eq('diagram_type', diagramType)
      .single();

    if (error) {
      console.error('Error fetching diagram:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      diagramType: data.diagram_type,
      projectId: data.project_id,
      nodes: data.nodes,
      edges: data.edges
    };
  } catch (err) {
    console.error('Error in getDiagramByProjectId:', err);
    throw new Error('Failed to fetch diagram');
  }
}

// Save or update a diagram
export async function saveDiagram(diagramData: {
  projectId: string;
  diagramType: string;
  nodes: any[];
  edges: any[];
}) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('project_diagrams')
      .upsert({
        project_id: diagramData.projectId,
        diagram_type: diagramData.diagramType,
        nodes: diagramData.nodes,
        edges: diagramData.edges,
        updated_at: new Date().toISOString()
      }, { onConflict: 'project_id,diagram_type' });

    if (error) {
      console.error('Error saving diagram:', error);
      throw new Error('Failed to save diagram');
    }

    return { success: true };
  } catch (err) {
    console.error('Error in saveDiagram:', err);
    throw new Error('Failed to save diagram');
  }
} 