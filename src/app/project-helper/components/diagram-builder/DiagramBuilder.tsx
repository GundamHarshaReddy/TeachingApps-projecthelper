import React, { useState, useCallback, useEffect, KeyboardEvent } from 'react';
import { ReactFlowProvider, useNodesState, useEdgesState, addEdge, Node, Edge, NodeChange, EdgeChange, Connection, XYPosition, MarkerType, ConnectionLineType } from 'reactflow';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { DiagramBuilderProps, AssistantDataFromPage, CanvasNodeData, FlowNodeData, ShapeNodeData, TextNodeData, ImageNodeData, CodeNodeData, DatabaseNodeData, MindMapNodeData } from './types';
import { v4 as uuidv4 } from 'uuid';
import { businessModelCanvasTemplate, leanCanvasTemplate } from './templates';

// Add Dialog components for the save modal
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

// SaveDialog component for naming diagrams
const SaveDialog = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialName = "",
  projectName = ""
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (name: string, description: string) => void;
  initialName?: string;
  projectName?: string;
}) => {
  const [name, setName] = useState(initialName || `${projectName} Diagram`);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen && !name) {
      // Set a default name when dialog opens
      setName(initialName || `${projectName} Diagram - ${new Date().toLocaleDateString()}`);
    }
  }, [isOpen, initialName, projectName, name]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Diagram</DialogTitle>
          <DialogDescription>
            Give your diagram a name to help identify it later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Optional description"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={() => onSave(name, description)}>
            Save Diagram
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const DiagramBuilder: React.FC<DiagramBuilderProps> = ({
  diagramData,
  projectData,
  onAssistantData,
  onSave,
  onExport,
  onClear,
  onShowHistory,
  onShowComments,
  templateType,
}) => {
  console.log("[DiagramBuilder] Initial props:", { diagramData, projectData, templateType });

  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(diagramData?.nodes || []);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(diagramData?.edges || []);
  const [history, setHistory] = useState<Array<{ nodes: Node[]; edges: Edge[] }>>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  
  // Add dialog state for save functionality
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  // Clipboard state for copy/paste
  const [clipboard, setClipboard] = useState<Node | null>(null);

  const saveToHistory = useCallback(() => {
    console.log("[DiagramBuilder] Attempting to save history...");
    const currentNodes = nodes;
    const currentEdges = edges;
    const newHistory = history.slice(0, currentHistoryIndex + 1);
    newHistory.push({ nodes: currentNodes, edges: currentEdges });
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    setHistory(newHistory);
    const newIndex = newHistory.length - 1;
    setCurrentHistoryIndex(newIndex);
    console.log("[DiagramBuilder] History saved. Index:", newIndex, "Nodes:", currentNodes.length, "Edges:", currentEdges.length);
  }, [nodes, edges, history, currentHistoryIndex]);

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    console.log("[DiagramBuilder] Updating node data:", { nodeId, newData });
    setNodes((currentNodes) => {
      const updatedNodes = currentNodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...newData,
            },
          };
        }
        return node;
      });
      setTimeout(saveToHistory, 0);
      return updatedNodes;
    });
  }, [setNodes, saveToHistory]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const dimensionChanges = changes.filter(c => c.type === 'dimensions');
      if (dimensionChanges.length > 0) {
         console.log("[DiagramBuilder] DIMENSION CHANGE DETECTED:", JSON.stringify(dimensionChanges));
      }
      console.log("[DiagramBuilder] onNodesChange called:", changes);
      onNodesChangeInternal(changes);
      
      // Only save to history if the change is not a position change or selection change
      const significantChanges = changes.filter(
        change => change.type !== 'position' && change.type !== 'select'
      );
      
      if (significantChanges.length > 0) {
        setNodes((currentNodes) => {
          setTimeout(saveToHistory, 0);
          return currentNodes;
        });
      }
    },
    [onNodesChangeInternal, saveToHistory, setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      console.log("[DiagramBuilder] onEdgesChange called:", changes);
      onEdgesChangeInternal(changes);
      
      // Only save to history if the change is not a selection change
      const significantChanges = changes.filter(change => change.type !== 'select');
      
      if (significantChanges.length > 0) {
        setEdges((currentEdges) => {
          setTimeout(saveToHistory, 0);
          return currentEdges;
        });
      }
    },
    [onEdgesChangeInternal, saveToHistory, setEdges]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      console.log("[DiagramBuilder] onConnect called with params:", params);
      
      console.log("[DiagramBuilder] Calling addEdge with connection params:", params);
      
      setEdges((eds) => {
        console.log("[DiagramBuilder] setEdges - BEFORE addEdge. Current edges:", eds);
        // Let addEdge convert the Connection to an Edge and add it
        const newEdges = addEdge(params, eds);
        console.log("[DiagramBuilder] setEdges - AFTER addEdge. New edges:", newEdges); 
        
        // Save to history
        setTimeout(() => {
          setNodes((currentNodes) => {
            const newState = { nodes: currentNodes, edges: newEdges };
            const newHistory = history.slice(0, currentHistoryIndex + 1);
            newHistory.push(newState);
            if (newHistory.length > 50) newHistory.shift();
            setHistory(newHistory);
            setCurrentHistoryIndex(newHistory.length - 1);
            console.log("[DiagramBuilder] History saved after adding edge. Index:", newHistory.length - 1);
            return currentNodes;
          });
        }, 0);
        
        return newEdges;
      });
    },
    [setEdges, setNodes, history, currentHistoryIndex, setHistory]
  );

  useEffect(() => {
    console.log("[DiagramBuilder] useEffect for diagramData running...");
    const initialNodes = diagramData?.nodes || [];
    const initialEdges = diagramData?.edges || [];
    setNodes(initialNodes);
    setEdges(initialEdges);
    setHistory([{ nodes: initialNodes, edges: initialEdges }]);
    setCurrentHistoryIndex(0);
    console.log("[DiagramBuilder] Initial state set:", { nodes: initialNodes.length, edges: initialEdges.length });
  }, [diagramData, setNodes, setEdges]);

  const handleAddNode = useCallback((type: string, position: XYPosition) => {
    console.log(`[DiagramBuilder] handleAddNode called: type=${type}, position=`, position);
    const id = `${type}-${uuidv4()}`;
    let newNode: Node | null = null;

    const commonData = { label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}` };

    switch (type) {
      case 'canvasNode':
        newNode = {
          id,
          type: 'canvasNode',
          position,
          data: { ...commonData, content: '' } as CanvasNodeData,
        };
        break;
      case 'flowNode':
        newNode = {
          id,
          type: 'flowNode',
          position,
          data: { ...commonData, content: '', role: 'process' } as FlowNodeData,
        };
        break;
      case 'shapeNode':
        newNode = {
          id,
          type: 'shapeNode',
          position,
          data: { ...commonData, shape: 'rectangle', text: '', color: '#ffffff', borderColor: '#cccccc', fontSize: 12 } as ShapeNodeData,
        };
        break;
      case 'textNode':
        newNode = {
          id,
          type: 'textNode',
          position,
          data: { ...commonData, text: 'Text' } as TextNodeData,
        };
        break;
      case 'imageNode':
        newNode = {
          id,
          type: 'imageNode',
          position,
          data: { ...commonData, src: '', alt: 'Image', width: 200, height: 150 } as ImageNodeData,
        };
        break;
      case 'codeNode':
        newNode = {
          id,
          type: 'codeNode',
          position,
          data: { ...commonData, code: '// Enter your code here', language: 'javascript' } as CodeNodeData,
        };
        break;
      case 'databaseNode':
        newNode = {
          id,
          type: 'databaseNode',
          position,
          data: { ...commonData, tables: [] } as DatabaseNodeData,
        };
        break;
      case 'mindMapNode':
        newNode = {
          id,
          type: 'mindMapNode',
          position,
          data: { ...commonData, items: [] } as MindMapNodeData,
        };
        break;
      default:
        console.warn("[DiagramBuilder] Attempted to add unknown node type:", type);
        return;
    }

    if (newNode) {
      console.log("[DiagramBuilder] Adding new node:", newNode);
      setNodes((nds) => {
        const updatedNodes = nds.concat(newNode!);
        setEdges((eds) => {
          const newState = { nodes: updatedNodes, edges: eds };
          const newHistory = history.slice(0, currentHistoryIndex + 1);
          newHistory.push(newState);
          if (newHistory.length > 50) newHistory.shift();
          setHistory(newHistory);
          setCurrentHistoryIndex(newHistory.length - 1);
          console.log("[DiagramBuilder] History saved after adding node. Index:", newHistory.length - 1);
          return eds;
        });
        return updatedNodes;
      });
    }
  }, [setNodes, setEdges, history, currentHistoryIndex]);

  const handleUndo = useCallback(() => {
    console.log("[DiagramBuilder] handleUndo called.");
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      const prevState = history[newIndex];
      console.log("[DiagramBuilder] Undoing to state:", prevState);
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setCurrentHistoryIndex(newIndex);
    }
  }, [currentHistoryIndex, history, setNodes, setEdges]);

  const handleRedo = useCallback(() => {
    console.log("[DiagramBuilder] handleRedo called.");
    if (currentHistoryIndex < history.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      const nextState = history[newIndex];
      console.log("[DiagramBuilder] Redoing to state:", nextState);
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setCurrentHistoryIndex(newIndex);
    }
  }, [currentHistoryIndex, history, setNodes, setEdges]);

  const handleSave = useCallback(() => {
    console.log("[DiagramBuilder] handleSave called.");
    // Open the save dialog instead of saving directly
    setIsSaveDialogOpen(true);
  }, []);
  
  // Add function to handle saving after name is provided
  const handleSaveWithName = useCallback((name: string, description: string) => {
    console.log("[DiagramBuilder] Saving diagram with name:", name);
    setIsSaveDialogOpen(false);
    
    if (onSave) {
      // Call the onSave prop with the current diagram state and name
      onSave({
        nodes,
        edges,
        name,
        description,
        projectId: projectData?.id,
        diagramType: templateType || "custom"
      });
    } else {
      console.warn("[DiagramBuilder] onSave prop not provided.");
    }
  }, [nodes, edges, onSave, projectData, templateType]);

  const handleExport = () => {
    console.log("[DiagramBuilder] handleExport called.");
    if (onExport) {
      onExport({ nodes, edges });
    }
  };

  const handleClear = () => {
    console.log("[DiagramBuilder] handleClear called.");
    setNodes([]);
    setEdges([]);
    const clearedState = { nodes: [], edges: [] };
    const newHistory = history.slice(0, currentHistoryIndex + 1);
    newHistory.push(clearedState);
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
    if (onClear) {
      onClear();
    }
  };

  const handleShowHistory = () => {
    if (onShowHistory) {
      onShowHistory();
    }
  };

  const handleShowComments = () => {
    console.log("[DiagramBuilder] handleShowComments called.");
    if (onShowComments) {
      onShowComments();
    } else {
      console.warn("[DiagramBuilder] onShowComments prop not provided.");
    }
  };

  const canUndo = currentHistoryIndex > 0;
  const canRedo = currentHistoryIndex < history.length - 1;

  const handleNodeResize = useCallback((nodeId: string, dimensions: { width: number; height: number }) => {
    console.log(`[DiagramBuilder] handleNodeResize called for ${nodeId}:`, dimensions);
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            width: dimensions.width,
            height: dimensions.height,
            data: {
              ...node.data,
              width: dimensions.width,
              height: dimensions.height,
            },
          };
        }
        return node;
      })
    );

    // Save to history after node resizing
    setNodes((currentNodes) => { 
      setEdges((currentEdges) => { 
        const newState = { nodes: currentNodes, edges: currentEdges };
        const newHistory = history.slice(0, currentHistoryIndex + 1);
        newHistory.push(newState);
        if (newHistory.length > 50) newHistory.shift();
        setHistory(newHistory);
        setCurrentHistoryIndex(newHistory.length - 1);
        console.log("[DiagramBuilder] History saved after explicit resize. Index:", newHistory.length - 1);
        return currentEdges;
      });
      return currentNodes;
    });
  }, [setNodes, setEdges, history, currentHistoryIndex]);

  const handleNodeSelect = useCallback((node: Node) => {
    setSelectedNode(node);
  }, []);

  const handleNodeDeselect = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Check if the target is an input or textarea
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    // Common modifier key check (Ctrl for Windows/Linux, Command for Mac)
    const isModifierKey = event.ctrlKey || event.metaKey;

    // Undo: Ctrl/Cmd + Z
    if (isModifierKey && event.key === 'z' && !event.shiftKey) {
      event.preventDefault();
      if (canUndo) handleUndo();
    }

    // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
    if ((isModifierKey && event.key === 'z' && event.shiftKey) || 
        (isModifierKey && event.key === 'y')) {
      event.preventDefault();
      if (canRedo) handleRedo();
    }

    // Save: Ctrl/Cmd + S
    if (isModifierKey && event.key === 's') {
      event.preventDefault();
      handleSave();
    }

    // Copy: Ctrl/Cmd + C
    if (isModifierKey && event.key === 'c' && selectedNode) {
      event.preventDefault();
      setClipboard(selectedNode);
    }

    // Paste: Ctrl/Cmd + V
    if (isModifierKey && event.key === 'v' && clipboard) {
      event.preventDefault();
      const newPosition = {
        x: clipboard.position.x + 20,
        y: clipboard.position.y + 20
      };
      if (clipboard.type) {
        handleAddNode(clipboard.type, newPosition);
      }
    }

    // Delete: Delete or Backspace
    if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNode) {
      event.preventDefault();
      onNodesChange([{ type: 'remove', id: selectedNode.id }]);
    }

    // Select all: Ctrl/Cmd + A
    if (isModifierKey && event.key === 'a') {
      event.preventDefault();
      setNodes((nds) => 
        nds.map(node => ({ ...node, selected: true }))
      );
    }

    // Clear selection: Escape
    if (event.key === 'Escape') {
      event.preventDefault();
      handleNodeDeselect();
      setNodes((nds) => 
        nds.map(node => ({ ...node, selected: false }))
      );
    }

    // Export: Ctrl/Cmd + E
    if (isModifierKey && event.key === 'e') {
      event.preventDefault();
      handleExport();
    }

    // Clear canvas: Ctrl/Cmd + Shift + C
    if (isModifierKey && event.shiftKey && event.key === 'c') {
      event.preventDefault();
      handleClear();
    }

  }, [canUndo, canRedo, handleUndo, handleRedo, handleSave, handleExport, handleClear, 
      selectedNode, clipboard, setNodes, handleNodeDeselect, onNodesChange, handleAddNode]);

  // Add event listener for keyboard shortcuts
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown as any);
    return () => {
      window.removeEventListener('keydown', handleKeyDown as any);
    };
  }, [handleKeyDown]);

  // --- Template Loading Logic ---
  const loadTemplate = useCallback((templateName: 'businessModelCanvas' | 'leanCanvas') => {
    console.log(`[DiagramBuilder] Loading template: ${templateName}`);
    let template;
    if (templateName === 'businessModelCanvas') {
      template = businessModelCanvasTemplate;
    } else if (templateName === 'leanCanvas') {
      template = leanCanvasTemplate;
    } else {
      console.warn(`[DiagramBuilder] Unknown template name: ${templateName}`);
      return;
    }

    // Deep copy template data to avoid mutation issues
    const templateNodes = JSON.parse(JSON.stringify(template.nodes));
    const templateEdges = JSON.parse(JSON.stringify(template.edges));

    setNodes(templateNodes);
    setEdges(templateEdges);

    // Reset history with the template as the initial state
    const initialState = { nodes: templateNodes, edges: templateEdges };
    setHistory([initialState]);
    setCurrentHistoryIndex(0);
    setSelectedNode(null); // Clear selection
    console.log(`[DiagramBuilder] Template ${templateName} loaded. History reset.`);

  }, [setNodes, setEdges, setHistory, setCurrentHistoryIndex]);
  // --- End Template Loading Logic ---

   // --- Continue to Assistance Logic ---
  const handleContinueToAssistance = useCallback(() => {
    console.log("[DiagramBuilder] handleContinueToAssistance called.");
    if (!projectData) {
      console.warn("[DiagramBuilder] Cannot continue to assistance: projectData is missing.");
      // Optionally, show a message to the user
      return;
    }
    if (!onAssistantData) {
       console.warn("[DiagramBuilder] Cannot continue to assistance: onAssistantData prop is missing.");
       return;
    }

    // Get current nodes and edges from state
    const currentNodes = nodes;
    const currentEdges = edges;

    // Prepare data for the assistant
    const assistantData: AssistantDataFromPage = {
      topic: projectData.projectName || projectData.projectDescription || 'Untitled Project',
      // TODO: Determine how to get specific goals - maybe from nodes? For now, an empty array.
      specificGoals: [],
      timeAvailable: projectData.duration || 'Not specified', // Assuming duration is a string like "X weeks"
      grade: projectData.grade || 'Not specified',
      projectDomain: projectData.projectDomain || 'General',
      projectId: projectData.id || null,
      // Include the current diagram state
      nodes: currentNodes,
      edges: currentEdges,
    };

    console.log("[DiagramBuilder] Calling onAssistantData with:", assistantData);
    onAssistantData(assistantData);

  }, [projectData, onAssistantData, nodes, edges]); // Added edges dependency
  // --- End Continue to Assistance Logic ---

  // Template loading effect - runs on initial render if templateType is provided
  useEffect(() => {
    if (templateType && nodes.length === 0) {
      console.log(`[DiagramBuilder] Loading template: ${templateType}`);
      
      // Load the appropriate template based on templateType
      if (templateType === 'businessCanvas') {
        loadTemplate('businessModelCanvas');
      } else if (templateType === 'leanCanvas') {
        loadTemplate('leanCanvas');
      }
      // For flowchart and mindmap, we could load specific starter templates here
      // or let the user start with a blank canvas with the right UI controls enabled
    }
  }, [templateType]); // eslint-disable-line react-hooks/exhaustive-deps - we only want this to run once

  return (
    <div className="flex h-screen w-full" style={{ height: '100vh', width: '100%' }} tabIndex={-1}>
      <Sidebar
        onAddNode={(type) => handleAddNode(type, { x: 100, y: 100 })}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={handleSave}
        onExport={handleExport}
        onClear={handleClear}
        onShowHistory={handleShowHistory}
        onShowComments={handleShowComments}
        canUndo={canUndo}
        canRedo={canRedo}
        onLoadTemplate={loadTemplate}
        onContinueToAssistance={handleContinueToAssistance}
      />
      <div className="flex-1 relative" style={{ height: '100%', width: '100%', minHeight: '500px' }}>
        <ReactFlowProvider>
          <Canvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            projectData={projectData}
            triggerUndo={handleUndo}
            triggerRedo={handleRedo}
            triggerAddNode={handleAddNode}
            onNodeResize={handleNodeResize}
            onSave={handleSave}
            onExport={handleExport}
            onClear={handleClear}
            onShowHistory={handleShowHistory}
            onShowComments={handleShowComments}
            updateNodeData={updateNodeData}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onNodeSelect={handleNodeSelect}
            onNodeDeselect={handleNodeDeselect}
          />
        </ReactFlowProvider>
      </div>
      
      {/* Save Dialog */}
      <SaveDialog 
        isOpen={isSaveDialogOpen} 
        onClose={() => setIsSaveDialogOpen(false)} 
        onSave={handleSaveWithName}
        initialName={diagramData?.name}
        projectName={projectData?.projectName || ""}
      />
    </div>
  );
}; 