"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { 
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  NodeTypes,
  EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { DiagramBuilderProps, AssistantData, DiagramData } from "../types";
import { v4 as uuidv4 } from 'uuid';
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Custom node component for Business Model Canvas sections
const CanvasNode = ({ data, selected }: any) => {
  return (
    <div className={`p-3 rounded-md border-2 ${selected ? 'border-blue-500' : 'border-gray-300'} bg-white shadow-md min-w-[180px] min-h-[100px]`}>
      <div className="font-bold text-gray-700 mb-2">{data.label}</div>
      <Textarea 
        className="w-full min-h-[80px] text-sm resize-none"
        value={data.content || ''}
        onChange={(e) => data.onChange(e.target.value)}
        placeholder={`Add ${data.label} details...`}
      />
    </div>
  );
};

// Node types definition
const nodeTypes: NodeTypes = {
  canvasNode: CanvasNode,
};

// Business Model Canvas sections
const bmcSections = [
  { id: 'key-partners', label: 'Key Partners', position: { x: 0, y: 0 } },
  { id: 'key-activities', label: 'Key Activities', position: { x: 220, y: 0 } },
  { id: 'value-propositions', label: 'Value Propositions', position: { x: 440, y: 0 } },
  { id: 'customer-relationships', label: 'Customer Relationships', position: { x: 660, y: 0 } },
  { id: 'customer-segments', label: 'Customer Segments', position: { x: 880, y: 0 } },
  { id: 'key-resources', label: 'Key Resources', position: { x: 220, y: 180 } },
  { id: 'channels', label: 'Channels', position: { x: 660, y: 180 } },
  { id: 'cost-structure', label: 'Cost Structure', position: { x: 220, y: 360 } },
  { id: 'revenue-streams', label: 'Revenue Streams', position: { x: 660, y: 360 } },
];

// Lean Canvas sections
const leanSections = [
  { id: 'problem', label: 'Problem', position: { x: 0, y: 0 } },
  { id: 'solution', label: 'Solution', position: { x: 220, y: 0 } },
  { id: 'unique-value-proposition', label: 'Unique Value Proposition', position: { x: 440, y: 0 } },
  { id: 'unfair-advantage', label: 'Unfair Advantage', position: { x: 660, y: 0 } },
  { id: 'customer-segments', label: 'Customer Segments', position: { x: 880, y: 0 } },
  { id: 'key-metrics', label: 'Key Metrics', position: { x: 220, y: 180 } },
  { id: 'channels', label: 'Channels', position: { x: 660, y: 180 } },
  { id: 'cost-structure', label: 'Cost Structure', position: { x: 220, y: 360 } },
  { id: 'revenue-streams', label: 'Revenue Streams', position: { x: 660, y: 360 } },
];

export default function DiagramBuilder({ diagramData, projectData, onAssistantData }: DiagramBuilderProps) {
  console.log('DiagramBuilder rendered with:', { diagramData, projectData });
  
  const [diagramType, setDiagramType] = useState<string>(diagramData?.diagramType || 'business-model-canvas');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [projectId, setProjectId] = useState<string | null | undefined>(diagramData?.projectId || projectData?.id);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  // Initialize canvas based on diagram type
  useEffect(() => {
    let initialNodes: any[] = [];
    
    if (diagramType === 'business-model-canvas') {
      initialNodes = bmcSections.map(section => ({
        id: section.id,
        type: 'canvasNode',
        position: section.position,
        data: { 
          label: section.label,
          content: '',
          onChange: (content: string) => {
            setNodes(nds => 
              nds.map(node => {
                if (node.id === section.id) {
                  return {
                    ...node,
                    data: {
                      ...node.data,
                      content,
                    },
                  };
                }
                return node;
              })
            );
          }
        },
      }));
    } else if (diagramType === 'lean-canvas') {
      initialNodes = leanSections.map(section => ({
        id: section.id,
        type: 'canvasNode',
        position: section.position,
        data: { 
          label: section.label,
          content: '',
          onChange: (content: string) => {
            setNodes(nds => 
              nds.map(node => {
                if (node.id === section.id) {
                  return {
                    ...node,
                    data: {
                      ...node.data,
                      content,
                    },
                  };
                }
                return node;
              })
            );
          }
        },
      }));
    }

    // Load existing diagram if available
    if (diagramData?.nodes && diagramData?.nodes.length > 0) {
      const loadedNodes = diagramData.nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          onChange: (content: string) => {
            setNodes(nds => 
              nds.map(n => {
                if (n.id === node.id) {
                  return {
                    ...n,
                    data: {
                      ...n.data,
                      content,
                    },
                  };
                }
                return n;
              })
            );
          }
        }
      }));
      setNodes(loadedNodes);
      setEdges(diagramData.edges || []);
    } else {
      setNodes(initialNodes);
      setEdges([]);
    }
  }, [diagramType, diagramData, setNodes, setEdges]);

  // Save diagram to Supabase
  const saveDiagram = async () => {
    if (!projectId) return;
    
    setIsSaving(true);
    setSavedMessage('');
    
    try {
      // Prepare nodes for storage by removing callback functions
      const nodesToSave = nodes.map(node => ({
        ...node,
        data: {
          label: node.data.label,
          content: node.data.content || '',
        }
      }));
      
      const { data, error } = await supabase
        .from('project_diagrams')
        .upsert({
          project_id: projectId,
          diagram_type: diagramType,
          nodes: nodesToSave,
          edges: edges,
          updated_at: new Date().toISOString()
        }, { onConflict: 'project_id,diagram_type' });
      
      if (error) {
        console.error('Error saving diagram:', error);
        setSavedMessage('Error saving diagram');
      } else {
        setSavedMessage('Diagram saved successfully');
        setTimeout(() => setSavedMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error in save process:', err);
      setSavedMessage('Error saving diagram');
    } finally {
      setIsSaving(false);
    }
  };

  // Continue to Assistant with diagram data
  const handleContinue = () => {
    // Extract content from nodes to pass to assistant
    const diagramContent = nodes.reduce((acc, node) => {
      acc[node.id] = node.data.content || '';
      return acc;
    }, {} as Record<string, string>);
    
    const assistantData: AssistantData = {
      topic: projectData?.projectName || '',
      specificGoals: `Diagram type: ${diagramType === 'business-model-canvas' ? 'Business Model Canvas' : 'Lean Canvas'}\n${JSON.stringify(diagramContent, null, 2)}`,
      timeAvailable: 'unknown',
      grade: projectData?.grade || '',
      projectDomain: projectData?.projectDomain || '',
      projectId: projectId || ''
    };
    
    onAssistantData(assistantData);
  };

  return (
    <div className="flex flex-col h-[80vh]">
      <div className="flex space-x-4 mb-4">
        <div className="w-1/4">
          <Label htmlFor="diagram-type">Diagram Type</Label>
          <Select value={diagramType} onValueChange={setDiagramType}>
            <SelectTrigger id="diagram-type">
              <SelectValue placeholder="Select diagram type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="business-model-canvas">Business Model Canvas</SelectItem>
              <SelectItem value="lean-canvas">Lean Canvas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end space-x-2">
          <Button 
            onClick={saveDiagram} 
            disabled={isSaving}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            {isSaving ? 'Saving...' : 'Save Diagram'}
          </Button>
          <Button 
            onClick={handleContinue}
            className="bg-pink-600 hover:bg-pink-700 text-white"
          >
            Continue to Assistant
          </Button>
          {savedMessage && (
            <span className="text-green-600 ml-2">{savedMessage}</span>
          )}
        </div>
      </div>
      
      <div className="flex-grow border rounded-md overflow-hidden" style={{ height: 'calc(100% - 60px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.1}
          maxZoom={1.5}
        >
          <Background color="#f8f8f8" gap={16} />
          <Controls />
          <MiniMap />
          <Panel position="top-right">
            <div className="bg-white p-2 rounded shadow-md text-xs">
              <p>Click on boxes to edit content</p>
              <p>Drag to reposition elements</p>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}