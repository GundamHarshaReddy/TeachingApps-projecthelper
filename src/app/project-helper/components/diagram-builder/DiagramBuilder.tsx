import React, { useState, useCallback, useEffect, KeyboardEvent, useRef } from 'react';
import { ReactFlowProvider, useNodesState, useEdgesState, addEdge, Node, Edge, NodeChange, EdgeChange, Connection, XYPosition, MarkerType, ConnectionLineType } from 'reactflow';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { DiagramBuilderProps, AssistantDataFromPage, CanvasNodeData, FlowNodeData, ShapeNodeData, TextNodeData, ImageNodeData, CodeNodeData, DatabaseNodeData, MindMapNodeData } from './types';
import { v4 as uuidv4 } from 'uuid';
import { businessModelCanvasTemplate, leanCanvasTemplate } from './templates';
import { extractDiagramContent, extractSpecificGoalsFromNodes } from './utils/diagramContentExtractor';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import { toPng, toSvg } from 'html-to-image';
import { ExportDialog } from './components/ExportDialog';

// Add Dialog components for the save modal
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
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
  const [name, setName] = useState(initialName || "");
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen && !name) {
      // Set a default name when dialog opens
      setName(initialName || `${projectName || "Project"} Diagram - ${new Date().toLocaleDateString()}`);
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

// Settings Dialog component
const SettingsDialog = ({ 
  isOpen, 
  onClose, 
  settings,
  onToggleSetting,
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  settings: { showMinimap: boolean; showGrid: boolean; snapToGrid: boolean };
  onToggleSetting: (setting: keyof typeof settings) => void;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Diagram Settings</DialogTitle>
          <DialogDescription>
            Customize your diagram editor experience.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-minimap" className="flex items-center gap-2">
              Show Minimap
              <span className="text-xs text-gray-500">(Navigation preview)</span>
            </Label>
            <button
              id="show-minimap"
              className={`w-14 h-7 rounded-full p-1 transition-colors ${settings.showMinimap ? 'bg-blue-600' : 'bg-gray-300'}`}
              onClick={() => onToggleSetting('showMinimap')}
            >
              <div 
                className={`w-5 h-5 rounded-full bg-white transform transition-transform ${settings.showMinimap ? 'translate-x-7' : ''}`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="show-grid" className="flex items-center gap-2">
              Show Grid
              <span className="text-xs text-gray-500">(Background dots)</span>
            </Label>
            <button
              id="show-grid"
              className={`w-14 h-7 rounded-full p-1 transition-colors ${settings.showGrid ? 'bg-blue-600' : 'bg-gray-300'}`}
              onClick={() => onToggleSetting('showGrid')}
            >
              <div 
                className={`w-5 h-5 rounded-full bg-white transform transition-transform ${settings.showGrid ? 'translate-x-7' : ''}`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="snap-to-grid" className="flex items-center gap-2">
              Snap to Grid
              <span className="text-xs text-gray-500">(Align elements automatically)</span>
            </Label>
            <button
              id="snap-to-grid"
              className={`w-14 h-7 rounded-full p-1 transition-colors ${settings.snapToGrid ? 'bg-blue-600' : 'bg-gray-300'}`}
              onClick={() => onToggleSetting('snapToGrid')}
            >
              <div 
                className={`w-5 h-5 rounded-full bg-white transform transition-transform ${settings.snapToGrid ? 'translate-x-7' : ''}`}
              />
            </button>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Add a ShortcutHelper component after SaveDialog and SettingsDialog
const ShortcutHelper = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  // Detect operating system
  const [os, setOs] = useState<'windows' | 'mac' | 'linux' | 'unknown'>('unknown');
  
  useEffect(() => {
    // Simple OS detection based on navigator.platform
    const platform = navigator.platform.toLowerCase();
    if (platform.includes('win')) {
      setOs('windows');
    } else if (platform.includes('mac') || platform.includes('iphone') || platform.includes('ipad')) {
      setOs('mac');
    } else if (platform.includes('linux') || platform.includes('android')) {
      setOs('linux');
    }
  }, []);
  
  // Format key based on OS
  const formatKey = (key: string): string => {
    if (os === 'mac') {
      if (key === 'Ctrl') return '⌘';
      if (key === 'Alt') return '⌥';
      if (key === 'Shift') return '⇧';
    }
    return key;
  };
  
  // Define shortcuts
  const shortcuts = [
    { 
      action: 'Undo', 
      windows: 'Ctrl + Z', 
      mac: '⌘ + Z', 
      linux: 'Ctrl + Z',
      description: 'Undo the last complete action'
    },
    { 
      action: 'Redo', 
      windows: 'Ctrl + Y', 
      mac: '⌘ + ⇧ + Z', 
      linux: 'Ctrl + Y or Ctrl + Shift + Z',
      description: 'Redo the last undone action'
    },
    { 
      action: 'Save Diagram', 
      windows: 'Ctrl + S', 
      mac: '⌘ + S', 
      linux: 'Ctrl + S'
    },
    { 
      action: 'Copy Selected Node', 
      windows: 'Ctrl + C', 
      mac: '⌘ + C', 
      linux: 'Ctrl + C'
    },
    { 
      action: 'Paste Node', 
      windows: 'Ctrl + V', 
      mac: '⌘ + V', 
      linux: 'Ctrl + V'
    },
    { 
      action: 'Duplicate Node', 
      windows: 'Ctrl + D', 
      mac: '⌘ + D', 
      linux: 'Ctrl + D'
    },
    { 
      action: 'Delete Selected Node', 
      windows: 'Delete', 
      mac: 'Delete or Backspace', 
      linux: 'Delete'
    },
    { 
      action: 'Deselect Node', 
      windows: 'Escape', 
      mac: 'Escape', 
      linux: 'Escape'
    },
    { 
      action: 'Export Diagram', 
      windows: 'Ctrl + E', 
      mac: '⌘ + E', 
      linux: 'Ctrl + E'
    },
    { 
      action: 'Clear Canvas', 
      windows: 'Ctrl + Shift + C', 
      mac: '⌘ + ⇧ + C', 
      linux: 'Ctrl + Shift + C'
    }
  ];
  
  // Get the current OS shortcuts
  const getCurrentShortcuts = () => {
    if (os === 'mac') return shortcuts.map(s => ({ action: s.action, keys: s.mac }));
    if (os === 'linux') return shortcuts.map(s => ({ action: s.action, keys: s.linux }));
    return shortcuts.map(s => ({ action: s.action, keys: s.windows }));
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Use these shortcuts to work more efficiently with the diagram builder.
            {os !== 'unknown' && ` Detected OS: ${os.charAt(0).toUpperCase() + os.slice(1)}`}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="grid grid-cols-2 gap-2">
            {getCurrentShortcuts().map((shortcut, index) => (
              <div key={index} className="flex flex-col p-2 border-b border-gray-100">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{shortcut.action}</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">{shortcut.keys}</code>
                </div>
                {shortcuts[index].description && (
                  <span className="text-xs text-gray-500">{shortcuts[index].description}</span>
                )}
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Define additional templates
const swotTemplate = {
  nodes: [
    {
      id: 'strengths',
      type: 'canvasNode',
      position: { x: 50, y: 50 },
      data: { label: 'Strengths', content: 'What do you do well?' },
      style: { background: '#e6ffee', width: 250, height: 200 }
    },
    {
      id: 'weaknesses',
      type: 'canvasNode',
      position: { x: 350, y: 50 },
      data: { label: 'Weaknesses', content: 'What could you improve?' },
      style: { background: '#ffe6e6', width: 250, height: 200 }
    },
    {
      id: 'opportunities',
      type: 'canvasNode',
      position: { x: 50, y: 300 },
      data: { label: 'Opportunities', content: 'What opportunities are open to you?' },
      style: { background: '#e6f7ff', width: 250, height: 200 }
    },
    {
      id: 'threats',
      type: 'canvasNode',
      position: { x: 350, y: 300 },
      data: { label: 'Threats', content: 'What threats could harm you?' },
      style: { background: '#fff5e6', width: 250, height: 200 }
    }
  ],
  edges: []
};

const aiModelCanvasTemplate = {
  nodes: [
    {
      id: 'problem',
      type: 'canvasNode',
      position: { x: 50, y: 50 },
      data: { label: 'Problem', content: 'What problem does your AI solve?' },
      style: { width: 200, height: 150 }
    },
    {
      id: 'data',
      type: 'canvasNode',
      position: { x: 300, y: 50 },
      data: { label: 'Data Sources', content: 'What data will you use?' },
      style: { width: 200, height: 150 }
    },
    {
      id: 'algorithms',
      type: 'canvasNode',
      position: { x: 550, y: 50 },
      data: { label: 'Algorithms', content: 'What AI techniques will you use?' },
      style: { width: 200, height: 150 }
    },
    {
      id: 'metrics',
      type: 'canvasNode',
      position: { x: 50, y: 250 },
      data: { label: 'Metrics', content: 'How will you measure success?' },
      style: { width: 200, height: 150 }
    },
    {
      id: 'implementation',
      type: 'canvasNode',
      position: { x: 300, y: 250 },
      data: { label: 'Implementation', content: 'How will you implement the model?' },
      style: { width: 200, height: 150 }
    },
    {
      id: 'ethics',
      type: 'canvasNode',
      position: { x: 550, y: 250 },
      data: { label: 'Ethics & Risks', content: 'What ethical considerations exist?' },
      style: { width: 200, height: 150 }
    }
  ],
  edges: []
};

// Add getNextNodeId function after all imports and before component declaration
// Helper function to generate unique node IDs with sequential numbering
const getNextNodeId = () => {
  return `node-${uuidv4().substring(0, 8)}`;
};

export const DiagramBuilder: React.FC<{
  diagramData?: any;
  projectData?: any;
  onAssistantData: (data: any) => void;
  onSave?: (data: any) => void;
  onExport?: (data: any) => void;
  onClear?: () => void;
  onShowHistory?: () => void;
  onShowComments?: () => void;
  templateType?: string;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
  onUpdate?: (data: any) => void;
}> = ({
  diagramData,
  projectData,
  onAssistantData,
  onSave,
  onExport,
  onClear,
  onShowHistory,
  onShowComments,
  templateType,
  isFullScreen = false,
  onToggleFullScreen,
  onUpdate,
}) => {
  console.log("[DiagramBuilder] Initializing with props:", { 
    diagramId: diagramData?.id,
    diagramName: diagramData?.name,
    nodeCount: diagramData?.nodes?.length || 0,
    edgeCount: diagramData?.edges?.length || 0,
    projectName: projectData?.projectName
  });

  // Check for any issues with the diagramData
  if (diagramData) {
    if (!Array.isArray(diagramData.nodes)) {
      console.warn("[DiagramBuilder] diagramData.nodes is not an array, initializing with empty array");
      diagramData.nodes = [];
    }
    if (!Array.isArray(diagramData.edges)) {
      console.warn("[DiagramBuilder] diagramData.edges is not an array, initializing with empty array");
      diagramData.edges = [];
    }
  }

  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(diagramData?.nodes || []);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(diagramData?.edges || []);
  const [history, setHistory] = useState<Array<{ nodes: Node[]; edges: Edge[] }>>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  
  // Add dialog state for save functionality
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveDialogInitialName, setSaveDialogInitialName] = useState("");

  // Clipboard state for copy/paste
  const [clipboard, setClipboard] = useState<Node | null>(null);

  // Add reactflow wrapper ref
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Add settings state for diagram features
  const [diagramSettings, setDiagramSettings] = useState({
    showMinimap: true,
    showGrid: true,
    snapToGrid: true,
  });

  // State for showing keyboard shortcuts
  const [showShortcutsPanel, setShowShortcutsPanel] = useState(false);

  // Add a timer ref for debouncing history saves
  const historyTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Function to toggle settings
  const toggleSetting = useCallback((setting: keyof typeof diagramSettings) => {
    setDiagramSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    console.log(`[DiagramBuilder] Toggled ${setting} to ${!diagramSettings[setting]}`);
  }, [diagramSettings]);

  // Function to open settings panel
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  const handleToggleSettings = useCallback(() => {
    setShowSettingsPanel(prev => !prev);
  }, []);

  // Function to toggle shortcuts panel
  const handleToggleShortcuts = useCallback(() => {
    setShowShortcutsPanel(prev => !prev);
  }, []);

  const saveToHistory = useCallback(() => {
    console.log("[DiagramBuilder] Attempting to save history...");
    const currentState = { nodes, edges };
    
    // Check if new state is different from current latest state
    if (currentHistoryIndex >= 0 && history.length > 0) {
      const latestState = history[currentHistoryIndex];
      const isIdentical = 
        JSON.stringify(latestState.nodes) === JSON.stringify(currentState.nodes) &&
        JSON.stringify(latestState.edges) === JSON.stringify(currentState.edges);
      
      if (isIdentical) {
        console.log("[DiagramBuilder] Skipping history save - state hasn't changed");
        return;
      }
    }
    
    const newHistory = history.slice(0, currentHistoryIndex + 1);
    newHistory.push(currentState);
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    setHistory(newHistory);
    const newIndex = newHistory.length - 1;
    setCurrentHistoryIndex(newIndex);
    console.log("[DiagramBuilder] History saved. Index:", newIndex, "Nodes:", nodes.length, "Edges:", edges.length);
  }, [nodes, edges, history, currentHistoryIndex]);

  // Debounced version of saveToHistory - only saves after a delay to batch changes
  const debouncedSaveToHistory = useCallback((immediate = false) => {
    // Clear any existing timer
    if (historyTimer.current) {
      clearTimeout(historyTimer.current);
      historyTimer.current = null;
    }
    
    // If immediate, save right away
    if (immediate) {
      saveToHistory();
      return;
    }
    
    // Otherwise set a timer to save after a short delay (batching changes)
    historyTimer.current = setTimeout(() => {
      saveToHistory();
      historyTimer.current = null;
    }, 500); // 500ms delay to batch changes
  }, [saveToHistory]);
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (historyTimer.current) {
        clearTimeout(historyTimer.current);
      }
    };
  }, []);

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
      // Use the debounced version instead of direct setTimeout
      debouncedSaveToHistory();
      return updatedNodes;
    });
  }, [setNodes, debouncedSaveToHistory]);

  // Track when a node drag operation begins and ends
  const [isDragging, setIsDragging] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [nodeSelectionChanging, setNodeSelectionChanging] = useState(false);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const dimensionChanges = changes.filter(c => c.type === 'dimensions');
      if (dimensionChanges.length > 0) {
         console.log("[DiagramBuilder] DIMENSION CHANGE DETECTED:", JSON.stringify(dimensionChanges));
      }
      
      // Detect drag start/end
      const positionChanges = changes.filter(c => c.type === 'position');
      const selectionChanges = changes.filter(c => c.type === 'select');
      const removalChanges = changes.filter(c => c.type === 'remove');
      
      // If we have position changes, we're dragging
      if (positionChanges.length > 0) {
        // Check if this is the start of dragging
        if (!isDragging) {
          setIsDragging(true);
          console.log("[DiagramBuilder] Node drag started");
        }
      } 
      // When there are no position changes but we were dragging,
      // it means the drag has ended
      else if (isDragging) {
        setIsDragging(false);
        console.log("[DiagramBuilder] Node drag ended - saving to history");
        debouncedSaveToHistory(true); // Save immediately when drag ends
      }
      
      // For selection changes, don't save to history
      if (selectionChanges.length > 0 && selectionChanges.length === changes.length) {
        setNodeSelectionChanging(true);
      } else if (nodeSelectionChanging) {
        setNodeSelectionChanging(false);
      }
      
      // Always apply the changes
      onNodesChangeInternal(changes);
      
      // For significant changes that aren't dragging or selection
      // (like adding, removing, or resizing nodes)
      if (removalChanges.length > 0 || dimensionChanges.length > 0) {
        console.log("[DiagramBuilder] Significant node change detected - saving to history");
        debouncedSaveToHistory(true); // Save immediately for these changes
      }
    },
    [onNodesChangeInternal, debouncedSaveToHistory, isDragging, nodeSelectionChanging]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      console.log("[DiagramBuilder] onEdgesChange called:", changes);
      
      // Detect edge selection changes vs. more significant changes
      const selectionChanges = changes.filter(change => change.type === 'select');
      const removalChanges = changes.filter(change => change.type === 'remove');
      
      // Always apply the changes
      onEdgesChangeInternal(changes);
      
      // Only save to history for significant changes (not selection)
      if (removalChanges.length > 0) {
        console.log("[DiagramBuilder] Edge removal detected - saving to history");
        debouncedSaveToHistory(true); // Save immediately for edge removal
      }
    },
    [onEdgesChangeInternal, debouncedSaveToHistory]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      console.log("[DiagramBuilder] onConnect called with:", connection);
      
      // Normalize handle IDs to ensure compatibility with both old and new formats
      let sourceHandle = connection.sourceHandle;
      let targetHandle = connection.targetHandle;
      
      if (sourceHandle && (sourceHandle.startsWith('source-') || sourceHandle.startsWith('target-'))) {
        const direction = sourceHandle.split('-')[1];
        sourceHandle = `handle-${direction}`;
      }
      
      if (targetHandle && (targetHandle.startsWith('source-') || targetHandle.startsWith('target-'))) {
        const direction = targetHandle.split('-')[1];
        targetHandle = `handle-${direction}`;
      }
      
      // Create connection with normalized handles
      const normalizedConnection = {
        ...connection,
        sourceHandle,
        targetHandle
      };
      
      setEdges((eds) => {
        const newEdges = addEdge(normalizedConnection, eds);
        
        // Save to history immediately when a connection is created
        setNodes((nds) => {
          debouncedSaveToHistory(true); // Save immediately for connections
          return nds;
        });
        
        return newEdges;
      });
    },
    [setEdges, setNodes, debouncedSaveToHistory]
  );

  useEffect(() => {
    console.log("[DiagramBuilder] useEffect for diagramData running...");
    
    // Normalize edge handles to work with the new handle system
    const normalizeEdgeHandles = (edges: Edge[]): Edge[] => {
      return edges.map(edge => {
        let sourceHandle = edge.sourceHandle;
        let targetHandle = edge.targetHandle;
        
        // Convert old handle formats to new format
        if (sourceHandle && (sourceHandle.startsWith('source-') || sourceHandle.startsWith('target-'))) {
          const direction = sourceHandle.split('-')[1];
          sourceHandle = `handle-${direction}`;
        }
        
        if (targetHandle && (targetHandle.startsWith('source-') || targetHandle.startsWith('target-'))) {
          const direction = targetHandle.split('-')[1];
          targetHandle = `handle-${direction}`;
        }
        
        return {
          ...edge,
          sourceHandle,
          targetHandle
        };
      });
    };
    
    const initialNodes = diagramData?.nodes || [];
    const initialEdges = normalizeEdgeHandles(diagramData?.edges || []);
    
    setNodes(initialNodes);
    setEdges(initialEdges);
    setHistory([{ nodes: initialNodes, edges: initialEdges }]);
    setCurrentHistoryIndex(0);
    console.log("[DiagramBuilder] Initial state set:", { nodes: initialNodes.length, edges: initialEdges.length });
  }, [diagramData, setNodes, setEdges]);

  const handleAddNode = useCallback((type: string, position: XYPosition) => {
    console.log(`[DiagramBuilder] handleAddNode called: type=${type}, position=`, position);
    
    // Handle special shape node types with format "shapeNode:shape_type"
    let nodeType = type;
    let shapeType = 'rectangle';
    
    // Parse the drag type information
    if (type.includes(':')) {
      const [baseType, subType] = type.split(':');
      nodeType = baseType;
      
      // For shape nodes, use the subType as the shape type
      if (baseType === 'shapeNode') {
        shapeType = subType;
        console.log(`[DiagramBuilder] Processing shape node with subtype: ${shapeType}`);
      }
    }
    
    const id = getNextNodeId();
    let newNode: Node | null = null;

    const commonData = { label: `New ${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}` };

    switch (nodeType) {
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
        console.log(`[DiagramBuilder] Creating shape node: ${shapeType} at`, position);
        
        // Set dimensions based on shape
        let dimensions = { width: 120, height: 80 };
        switch (shapeType) {
          case 'circle':
          case 'diamond':
            dimensions = { width: 100, height: 100 };
            break;
          case 'triangle':
            dimensions = { width: 120, height: 100 };
            break;
          case 'cylinder':
            dimensions = { width: 100, height: 120 };
            break;
          case 'process':
            dimensions = { width: 140, height: 70 };
            break;
        }
        
        newNode = {
          id,
          type: 'shapeNode',
          position,
          data: { 
            ...commonData, 
            shape: shapeType, 
            text: '', 
            color: '#ffffff', 
            borderColor: '#cccccc', 
            fontSize: 12,
            width: dimensions.width,
            height: dimensions.height,
          } as ShapeNodeData,
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
        console.log(`[DiagramBuilder] Creating image node at:`, position);
        newNode = {
          id,
          type: 'imageNode',
          position,
          data: { 
            ...commonData, 
            alt: 'Image', 
            width: 200, 
            height: 150,
            // Add a default placeholder image - a data URL for a simple placeholder
            imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2YxZjVmOSIvPjx0ZXh0IHg9IjEwMCIgeT0iNzUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk0YTNiOCI+Q2xpY2sgdG8gdXBsb2FkIGltYWdlPC90ZXh0Pjwvc3ZnPg==',
            onUpdate: (nodeId: string, newData: any) => updateNodeData(nodeId, newData)
          } as ImageNodeData,
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
      // Note: All nodes use the 'handle-{position}' ID format for connections
      // This standardized system allows for connecting any handle to any other handle
      setNodes((nds) => {
        const updatedNodes = nds.concat(newNode!);
        debouncedSaveToHistory(true); // Save immediately after adding a node
        return updatedNodes;
      });
    }
  }, [setNodes, debouncedSaveToHistory]);

  const handleUndo = useCallback(() => {
    console.log("[DiagramBuilder] handleUndo called. Current index:", currentHistoryIndex);
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      const prevState = history[newIndex];
      console.log("[DiagramBuilder] Undoing to state:", prevState, "New index:", newIndex);
      
      // Prevent nodes/edges change from triggering new history entries
      const isUndoingOrRedoing = true;
      
      // Apply previous state
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setCurrentHistoryIndex(newIndex);
    } else {
      console.log("[DiagramBuilder] Cannot undo - at earliest state");
    }
  }, [currentHistoryIndex, history, setNodes, setEdges]);

  const handleRedo = useCallback(() => {
    console.log("[DiagramBuilder] handleRedo called. Current index:", currentHistoryIndex, "History length:", history.length);
    if (currentHistoryIndex < history.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      const nextState = history[newIndex];
      console.log("[DiagramBuilder] Redoing to state:", nextState, "New index:", newIndex);
      
      // Prevent nodes/edges change from triggering new history entries  
      const isUndoingOrRedoing = true;
      
      // Apply next state
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setCurrentHistoryIndex(newIndex);
    } else {
      console.log("[DiagramBuilder] Cannot redo - at latest state");
    }
  }, [currentHistoryIndex, history, setNodes, setEdges]);

  // Function to open save dialog
  const openSaveDialog = useCallback(() => {
    // Use existing diagram name from the server or create a default one
    let defaultName;
    
    // First check if we have a loaded diagram with an ID and name
    if (diagramData?.id && diagramData.name) {
      // Use the existing name for the loaded diagram
      defaultName = diagramData.name;
      console.log("[DiagramBuilder] Using existing diagram name:", defaultName);
    } else {
      // Otherwise create a new default name
      const projectName = projectData?.projectName || "Project";
      defaultName = `${projectName} Diagram`;
      console.log("[DiagramBuilder] Creating new default name:", defaultName);
    }
    
    console.log("[DiagramBuilder] Opening save dialog with name:", defaultName);
    setSaveDialogInitialName(defaultName);
    setIsSaveDialogOpen(true);
  }, [diagramData, projectData]);
  
  // Add function to handle saving after name is provided
  const handleSaveDiagram = useCallback((name: string, description: string) => {
    console.log("[DiagramBuilder] Saving diagram with name:", name);
    setIsSaveDialogOpen(false);
    
    if (onSave) {
      // Before saving, make sure we're passing deep copies of nodes and edges
      // to prevent any shared reference issues
      const nodesCopy = JSON.parse(JSON.stringify(nodes));
      const edgesCopy = JSON.parse(JSON.stringify(edges));
      
      // Get ID if this is an existing diagram
      const diagramId = diagramData?.id;
      
      console.log("[DiagramBuilder] Saving diagram data:", { 
        nodes: nodesCopy.length, 
        edges: edgesCopy.length,
        name,
        description,
        id: diagramId // Log if we have an ID for debugging
      });
      
      // Call the onSave prop with the current diagram state and name
      onSave({
        nodes: nodesCopy,
        edges: edgesCopy,
        name,
        description,
        projectId: projectData?.id,
        diagramType: templateType || "custom",
        // Add diagram ID if editing an existing diagram
        id: diagramId
      });
      
      // Add to history after saving
      saveToHistory();
    } else {
      console.warn("[DiagramBuilder] onSave prop not provided.");
    }
  }, [nodes, edges, onSave, projectData, templateType, diagramData?.id, saveToHistory]);

  // Define types for the export dialog state and options
  const [exportOptionsOpen, setExportOptionsOpen] = useState<boolean>(false);
  
  // Define the export function with proper types
  const handleExportDiagram = useCallback((format?: string | { nodes: Node[]; edges: Edge[] }) => {
    console.log("[DiagramBuilder] handleExportDiagram called.");
    
    // If we got an object with nodes and edges, use the original export handler
    if (typeof format === 'object' && format !== null && 'nodes' in format && 'edges' in format) {
      if (onExport) {
        onExport(format);
      }
      return;
    }
    
    // Otherwise, handle as a string format
    const exportFormat = typeof format === 'string' ? format : 'png';
    console.log(`[DiagramBuilder] handleExportDiagram called with format: ${exportFormat}`);
    
    // Get the diagram name (for the file name)
    const diagramName = diagramData?.name || `diagram-${new Date().getTime()}`;
    const safeFileName = diagramName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    
    // Get the ReactFlow element
    const reactFlowNode = document.querySelector('.react-flow');
    if (!reactFlowNode) {
      console.error('[DiagramBuilder] Could not find ReactFlow node for export');
      alert('Error: Could not export diagram. Please try again.');
      return;
    }
    
    // Create a temporary dialog to show export options if no format specified
    if (exportFormat === 'options') {
      setExportOptionsOpen(true);
      return;
    }
    
    // Handle different export formats
    switch (exportFormat) {
      case 'png':
        // Export as PNG image
        toPng(reactFlowNode as HTMLElement, { 
          backgroundColor: '#ffffff',
          quality: 0.95
        })
          .then((dataUrl) => {
            // Create a download link
            const link = document.createElement('a');
            link.download = `${safeFileName}.png`;
            link.href = dataUrl;
            link.click();
            console.log('[DiagramBuilder] PNG export complete');
          })
          .catch((error) => {
            console.error('[DiagramBuilder] PNG export error:', error);
            alert('Error exporting diagram as PNG. Please try again.');
          });
        break;
        
      case 'svg':
        // Export as SVG image
        toSvg(reactFlowNode as HTMLElement, { 
          backgroundColor: '#ffffff'
        })
          .then((dataUrl) => {
            // Create a download link
            const link = document.createElement('a');
            link.download = `${safeFileName}.svg`;
            link.href = dataUrl;
            link.click();
            console.log('[DiagramBuilder] SVG export complete');
          })
          .catch((error) => {
            console.error('[DiagramBuilder] SVG export error:', error);
            alert('Error exporting diagram as SVG. Please try again.');
          });
        break;
        
      case 'json':
        // Export as JSON data
        try {
          // Create a JSON object with the diagram data
          const exportData = {
            nodes,
            edges,
            name: diagramData?.name || 'Untitled Diagram',
            version: 1,
            exportDate: new Date().toISOString(),
          };
          
          // Convert to a JSON string
          const jsonString = JSON.stringify(exportData, null, 2);
          
          // Create a Blob with the JSON data
          const blob = new Blob([jsonString], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          
          // Create a download link
          const link = document.createElement('a');
          link.download = `${safeFileName}.json`;
          link.href = url;
          link.click();
          
          // Clean up the URL object after download
          setTimeout(() => URL.revokeObjectURL(url), 500);
          
          console.log('[DiagramBuilder] JSON export complete');
        } catch (error) {
          console.error('[DiagramBuilder] JSON export error:', error);
          alert('Error exporting diagram as JSON. Please try again.');
        }
        break;
        
      default:
        console.warn(`[DiagramBuilder] Unknown export format: ${exportFormat}`);
        if (onExport) {
          // Fall back to original export handler if provided
          onExport({ nodes, edges });
        }
    }
  }, [nodes, edges, diagramData, onExport]);

  const handleClearDiagram = () => {
    console.log("[DiagramBuilder] handleClearDiagram called.");
    setNodes([]);
    setEdges([]);
    
    // Save to history with empty state
    debouncedSaveToHistory(true); // Immediate save for clearing
    
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

    // Save to history after node resizing (using debounced version)
    debouncedSaveToHistory(true); // Immediate save for resizing
  }, [setNodes, debouncedSaveToHistory]);

  const handleNodeSelect = useCallback((node: Node) => {
    setSelectedNode(node);
    console.log("[DiagramBuilder] Node selected:", node);
  }, []);

  const handleNodeDeselect = useCallback(() => {
    setSelectedNode(null);
    console.log("[DiagramBuilder] Node deselected");
  }, []);

  // Handle node deletion
  const handleNodeDelete = useCallback(() => {
    if (selectedNode) {
      console.log("[DiagramBuilder] Deleting node:", selectedNode.id);
      onNodesChange([{ type: 'remove', id: selectedNode.id }]);
      setSelectedNode(null);
    }
  }, [selectedNode, onNodesChange]);

  // Handle node duplication
  const handleNodeDuplicate = useCallback(() => {
    if (selectedNode) {
      console.log("[DiagramBuilder] Duplicating node:", selectedNode.id);
      
      // Create new ID for duplicated node
      const newId = `${selectedNode.type}-${uuidv4()}`;
      
      // Create new position slightly offset from original
      const newPosition = {
        x: selectedNode.position.x + 20,
        y: selectedNode.position.y + 20
      };
      
      // Create the duplicated node
      const duplicatedNode: Node = {
        ...selectedNode,
        id: newId,
        position: newPosition,
        selected: false,
        data: { ...selectedNode.data }
      };
      
      // Add to nodes array
      setNodes(nds => [...nds, duplicatedNode]);
    }
  }, [selectedNode, setNodes]);

  // Handle node copy
  const handleNodeCopy = useCallback(() => {
    if (selectedNode) {
      console.log("[DiagramBuilder] Copying node to clipboard:", selectedNode.id);
      setClipboard(selectedNode);
    }
  }, [selectedNode]);

  // Handle node paste
  const handleNodePaste = useCallback(() => {
    if (clipboard) {
      console.log("[DiagramBuilder] Pasting node from clipboard");
      
      // Create new ID for pasted node
      const newId = `${clipboard.type}-${uuidv4()}`;
      
      // Create new position slightly offset from original
      const newPosition = {
        x: clipboard.position.x + 20,
        y: clipboard.position.y + 20
      };
      
      // Create the pasted node
      const pastedNode: Node = {
        ...clipboard,
        id: newId,
        position: newPosition,
        selected: false,
        data: { ...clipboard.data }
      };
      
      // Add to nodes array
      setNodes(nds => [...nds, pastedNode]);
    }
  }, [clipboard, setNodes]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    console.log("[DiagramBuilder] handleKeyDown called with key:", e.key);
    
    // Skip if the user is editing text
    const { activeElement } = document;
    if (activeElement instanceof HTMLInputElement || 
        activeElement instanceof HTMLTextAreaElement || 
        (activeElement as HTMLElement)?.hasAttribute('contenteditable')) {
      console.log("[DiagramBuilder] Ignoring keyboard shortcut - user is editing text");
      return;
    }
    
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdKey = isMac ? e.metaKey : e.ctrlKey;
    
    // Undo: Ctrl+Z / Cmd+Z
    if (cmdKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      console.log("[DiagramBuilder] Executing undo shortcut");
      handleUndo();
    }
    
    // Redo: Ctrl+Shift+Z / Cmd+Shift+Z or Ctrl+Y / Cmd+Y
    if ((cmdKey && e.key === 'z' && e.shiftKey) || (cmdKey && e.key === 'y')) {
      e.preventDefault();
      console.log("[DiagramBuilder] Executing redo shortcut");
      handleRedo();
    }
    
    // Save: Ctrl+S / Cmd+S
    if (cmdKey && e.key === 's') {
      e.preventDefault();
      console.log("[DiagramBuilder] Executing save shortcut");
      openSaveDialog();
    }
    
    // Export: Ctrl+E / Cmd+E
    if (cmdKey && e.key === 'e') {
      e.preventDefault();
      console.log("[DiagramBuilder] Executing export shortcut");
      handleExportDiagram('options');
    }
    
    // Delete selected node: Delete / Backspace
    if (e.key === 'Delete' || e.key === 'Backspace') {
      // Only if we have a selected node and not editing text
      if (selectedNode && !document.activeElement?.matches('input, textarea, [contenteditable]')) {
        e.preventDefault();
        console.log("[DiagramBuilder] Executing delete shortcut");
        handleNodeDelete();
      }
    }
  }, [handleUndo, handleRedo, openSaveDialog, handleNodeDelete, selectedNode, handleExportDiagram]);

  // Add event listener for keyboard shortcuts
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown as any);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown as any);
    };
  }, [handleKeyDown]);

  // Simplify the template loading handler to use the imported templates
  const handleLoadTemplate = useCallback((templateName: string) => {
    console.log(`[DiagramBuilder] Loading template: ${templateName}`);
    
    let template;
    switch(templateName) {
      case 'businessModelCanvas':
        template = businessModelCanvasTemplate;
        break;
      case 'leanCanvas': 
        template = leanCanvasTemplate;
        break;
      case 'swot':
        template = swotTemplate;
        break;
      case 'aiModelCanvas':
        template = aiModelCanvasTemplate;
        break;
      default:
        console.warn(`[DiagramBuilder] Unknown template: ${templateName}`);
        return;
    }
    
    // Make deep copies to avoid mutation
    const nodes = JSON.parse(JSON.stringify(template.nodes));
    const edges = JSON.parse(JSON.stringify(template.edges));
    
    // Set nodes and edges
    setNodes(nodes);
    setEdges(edges);
    
    // Reset history
    setHistory([{ nodes, edges }]);
    setCurrentHistoryIndex(0);
    
    // Clear selection
    setSelectedNode(null);
    
    console.log(`[DiagramBuilder] Loaded template: ${templateName}`);
  }, [setNodes, setEdges, setHistory, setCurrentHistoryIndex]);

   // --- Continue to Assistance Logic ---
  const handleGenerateAssistantData = useCallback(() => {
    console.log("[DiagramBuilder] ***** CONTINUE TO ASSISTANCE BUTTON CLICKED *****");
    console.log("[DiagramBuilder] handleGenerateAssistantData called.");
    if (!projectData) {
      console.warn("[DiagramBuilder] Cannot continue to assistance: projectData is missing.");
      alert("Missing project data - please ensure you have a project selected.");
      return;
    }
    
    // Get current nodes and edges from state
    const currentNodes = nodes;
    const currentEdges = edges;

    // Extract readable content from diagram
    const diagramContentText = extractDiagramContent(currentNodes, currentEdges);
    console.log("[DiagramBuilder] Extracted diagram content:", diagramContentText.substring(0, 100) + "...");
    
    // Extract specific goals from nodes (for example, from text/canvas nodes)
    const specificGoals = extractSpecificGoalsFromNodes(currentNodes);

    // Prepare data for the assistant
    const assistantData: AssistantDataFromPage = {
      topic: projectData.projectName || projectData.projectDescription || 'Untitled Project',
      specificGoals: specificGoals.length > 0 ? specificGoals : ['Understanding the diagram'],
      timeAvailable: projectData.duration || 'Not specified',
      grade: projectData.grade || 'Not specified',
      projectDomain: projectData.projectDomain || 'General',
      projectId: projectData.id || null,
      // Include the current diagram state
      nodes: currentNodes,
      edges: currentEdges,
      // Add the extracted content as a field
      diagramContent: diagramContentText
    };

    console.log("[DiagramBuilder] Calling onAssistantData with:", assistantData);
    
    try {
      // Call the onAssistantData prop with the prepared data
      onAssistantData(assistantData);
      console.log("[DiagramBuilder] Successfully called onAssistantData");
    } catch (error) {
      console.error("[DiagramBuilder] Error in onAssistantData:", error);
      alert("An error occurred while preparing assistant data. Please try again.");
    }
  }, [nodes, edges, projectData, onAssistantData, extractDiagramContent, extractSpecificGoalsFromNodes]);

  // Template loading effect - runs on initial render if templateType is provided
  useEffect(() => {
    if (templateType && nodes.length === 0) {
      console.log(`[DiagramBuilder] Loading template: ${templateType}`);
      
      // Load the appropriate template based on templateType
      if (templateType === 'businessCanvas') {
        handleLoadTemplate('businessModelCanvas');
      } else if (templateType === 'leanCanvas') {
        handleLoadTemplate('leanCanvas');
      }
      // For flowchart and mindmap, we could load specific starter templates here
      // or let the user start with a blank canvas with the right UI controls enabled
    }
  }, [templateType]); // eslint-disable-line react-hooks/exhaustive-deps - we only want this to run once

  // Fix Sidebar props to match the component's interface
  const handleAddNodeWithPosition = (type: string, position?: { x: number; y: number }) => {
    if (!position) {
      // Default position in the center of the viewport
      const position = { 
        x: window.innerWidth / 2 - 100, 
        y: window.innerHeight / 2 - 100 
      };
      handleAddNode(type, position);
    } else {
      handleAddNode(type, position);
    }
  };

  // Handle export dialog close
  const handleExportOptionsClose = () => {
    setExportOptionsOpen(false);
  };

  // Handle export format selection from dialog
  const handleExportFormatSelect = (format: string) => {
    handleExportDiagram(format);
    setExportOptionsOpen(false);
  };

  // Add useEffect to report state changes back to parent
  useEffect(() => {
    // Call onUpdate callback when nodes or edges change, if provided
    if (onUpdate && (nodes.length > 0 || edges.length > 0)) {
      console.log("[DiagramBuilder] Notifying parent of diagram changes");
      const currentState = {
        nodes,
        edges,
        name: diagramData?.name,
        diagramType: diagramData?.diagramType
      };
      
      onUpdate(currentState);
    }
  }, [nodes, edges, onUpdate, diagramData?.name, diagramData?.diagramType]);

  return (
    <ReactFlowProvider>
      <div className={cn(
        "flex bg-gray-50",
        isFullScreen ? "h-screen w-screen" : "h-[800px] w-full" 
      )}>
        <Sidebar
          onAddNode={handleAddNodeWithPosition}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onSave={openSaveDialog}
          onExport={handleExportDiagram}
          onClear={handleClearDiagram}
          onShowHistory={handleShowHistory}
          onShowComments={handleShowComments}
          onContinueToAssistance={handleGenerateAssistantData}
          onToggleSettings={handleToggleSettings}
          onToggleShortcuts={handleToggleShortcuts}
          onLoadTemplate={handleLoadTemplate}
        />
        <div 
          className="flex-grow h-full relative"
          onDragOver={(e) => e.preventDefault()}
          ref={reactFlowWrapper}
        >
          {isFullScreen && onToggleFullScreen && (
            <Button 
              variant="outline"
              size="sm"
              onClick={onToggleFullScreen}
              className="absolute top-4 left-4 z-20 bg-white shadow"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
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
            onSave={openSaveDialog}
            onExport={handleExportDiagram}
            onClear={handleClearDiagram}
            onShowHistory={handleShowHistory}
            onShowComments={handleShowComments}
            updateNodeData={updateNodeData}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onNodeSelect={handleNodeSelect}
            onNodeDeselect={handleNodeDeselect}
            settings={diagramSettings}
          />
        </div>

        {/* Save Dialog */}
        <SaveDialog 
          isOpen={isSaveDialogOpen} 
          onClose={() => setIsSaveDialogOpen(false)} 
          onSave={handleSaveDiagram}
          initialName={saveDialogInitialName}
          projectName={projectData?.projectName || ""}
        />

        {/* Settings Dialog */}
        <SettingsDialog 
          isOpen={showSettingsPanel} 
          onClose={() => setShowSettingsPanel(false)} 
          settings={diagramSettings}
          onToggleSetting={toggleSetting}
        />

        {/* Shortcut Helper */}
        <ShortcutHelper 
          isOpen={showShortcutsPanel} 
          onClose={handleToggleShortcuts}
        />

        {/* Export Dialog */}
        <ExportDialog 
          isOpen={exportOptionsOpen} 
          onClose={handleExportOptionsClose}
          onExport={(format) => handleExportDiagram(format)}
        />
      </div>
    </ReactFlowProvider>
  );
};