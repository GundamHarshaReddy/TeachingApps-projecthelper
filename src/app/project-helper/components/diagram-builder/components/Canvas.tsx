import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  useReactFlow,
  Panel,
  NodeProps,
  MarkerType,
  ConnectionMode,
  ConnectionLineType,
  BackgroundVariant,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CanvasNode, FlowNode, ShapeNode, TextNode, ImageNode, CodeNode, DatabaseNode, MindMapNode } from './nodes';
import { DiagramBuilderProps, ShapeNodeData } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { NodeContextMenu } from './NodeContextMenu';
import { Info, Fullscreen, Maximize, ZoomIn } from 'lucide-react';

// Define nodeTypes *outside* the component function
const nodeTypes = {
  canvasNode: CanvasNode,
  flowNode: FlowNode,
  shapeNode: ShapeNode,
  textNode: TextNode,
  imageNode: ImageNode,
  codeNode: CodeNode,
  databaseNode: DatabaseNode,
  mindMapNode: MindMapNode,
};

// Define edgeTypes *outside* the component function (even if using defaults)
const edgeTypes = {
  // You could add custom edge types here if needed
  // Example: customEdge: CustomEdgeComponent
};

interface CanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  projectData?: any;
  triggerUndo: () => void;
  triggerRedo: () => void;
  triggerAddNode: (type: string, position: { x: number; y: number }) => void;
  onNodeResize: (nodeId: string, dimensions: { width: number; height: number }) => void;
  onSave?: (data: { nodes: Node[]; edges: Edge[] }) => void;
  onExport?: (data: { nodes: Node[]; edges: Edge[] }) => void;
  onClear?: () => void;
  onShowHistory?: () => void;
  onShowComments?: () => void;
  updateNodeData: (nodeId: string, newData: any) => void;
  onUndo: () => void;
  onRedo: () => void;
  onNodeSelect: (node: Node) => void;
  onNodeDeselect: () => void;
  settings?: {
    showMinimap: boolean;
    showGrid: boolean;
    snapToGrid: boolean;
  };
}

export const Canvas: React.FC<CanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  projectData,
  triggerUndo,
  triggerRedo,
  triggerAddNode,
  onNodeResize,
  onSave,
  onExport,
  onClear,
  onShowHistory,
  onShowComments,
  updateNodeData,
  onUndo,
  onRedo,
  onNodeSelect,
  onNodeDeselect,
  settings = { showMinimap: true, showGrid: true, snapToGrid: true },
}) => {
  // This wrapper now just renders the ReactFlowProvider and inner component
  return (
    <ReactFlowProvider>
      <CanvasInner 
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        projectData={projectData}
        triggerUndo={triggerUndo}
        triggerRedo={triggerRedo}
        triggerAddNode={triggerAddNode}
        onNodeResize={onNodeResize}
        onSave={onSave}
        onExport={onExport}
        onClear={onClear}
        onShowHistory={onShowHistory}
        onShowComments={onShowComments}
        updateNodeData={updateNodeData}
        onUndo={onUndo}
        onRedo={onRedo}
        onNodeSelect={onNodeSelect}
        onNodeDeselect={onNodeDeselect}
        settings={settings}
      />
    </ReactFlowProvider>
  );
};

// Inner component that can safely use useReactFlow
const CanvasInner: React.FC<CanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  projectData,
  triggerUndo,
  triggerRedo,
  triggerAddNode,
  onNodeResize,
  onSave,
  onExport,
  onClear,
  onShowHistory,
  onShowComments,
  updateNodeData,
  onUndo,
  onRedo,
  onNodeSelect,
  onNodeDeselect,
  settings = { showMinimap: true, showGrid: true, snapToGrid: true },
}) => {
  const reactFlowInstance = useReactFlow();
  const [contextMenu, setContextMenu] = useState<{
    node: Node;
    position: { x: number; y: number };
  } | null>(null);
  const [showHelp, setShowHelp] = useState(true);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Handle node click
  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // Skip if the click was on a button or input - prevent conflict with image node interactions
      const target = event.target as HTMLElement;
      if (target.closest('button') || target.closest('input') || target.classList.contains('nodrag')) {
        console.log("[Canvas] Click on interactive element within node - not showing context menu");
        return;
      }
      
      event.preventDefault();
      event.stopPropagation();
      
      // Get the node's DOM element
      const nodeElement = event.target as HTMLElement;
      const rect = nodeElement.getBoundingClientRect();
      
      // Calculate position for context menu (right side of the node)
      const position = {
        x: rect.right,
        y: rect.top
      };

      setContextMenu({
        node,
        position
      });
      onNodeSelect(node);
    },
    [onNodeSelect]
  );

  // Handle background click to close context menu
  const onPaneClick = useCallback(() => {
    setContextMenu(null);
    onNodeDeselect();
  }, [onNodeDeselect]);

  const handleAddNode = useCallback((type: string, position?: { x: number, y: number }) => {
    const newNodePosition = position || reactFlowInstance.project({ 
        x: window.innerWidth / 2 - 100,
        y: window.innerHeight / 2 - 50 
      });

    triggerAddNode(type, newNodePosition);
  }, [reactFlowInstance, triggerAddNode]);

  // Add onUpdate function to each node's data
  const nodesWithUpdate = nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      onUpdate: (nodeId: string, newData: any) => {
        console.log(`[Canvas] Node ${nodeId} requesting update:`, newData);
        updateNodeData(nodeId, newData);
      },
    }
  }));

  // Handle edge connections
  const handleConnect = useCallback((connection: Connection) => {
    console.log("[Canvas] handleConnect TRIGGERED", connection);

    // Validate connection endpoints - guarantees source and target are strings after this
    if (!connection.source || !connection.target) {
      console.warn('Invalid connection - missing endpoints');
      return;
    }
    
    // Normalize handle IDs to ensure compatibility with both old and new formats
    // Convert any "source-*" or "target-*" formats to "handle-*" format
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

    // Create properly typed edge with unified handle system
    const newEdge: Edge = {
      id: uuidv4(),
      source: connection.source,
      target: connection.target,
      sourceHandle: sourceHandle || null,
      targetHandle: targetHandle || null,
      type: 'default',
      markerEnd: { type: MarkerType.ArrowClosed },
    };

    onEdgesChange([{
      type: 'add',
      item: newEdge
    }]);

    // Pass the original 'connection' object which has the correct type
    onConnect(connection);
  }, [onConnect, onEdgesChange]);

  // Auto-hide help after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHelp(false);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);

  // Add a method to get flow position from client coordinates
  const getFlowPosition = useCallback((clientX: number, clientY: number) => {
    const reactFlowBounds = document.querySelector('.react-flow')?.getBoundingClientRect();
    if (!reactFlowBounds) return { x: 0, y: 0 };
    
    const position = reactFlowInstance.project({
      x: clientX - reactFlowBounds.left,
      y: clientY - reactFlowBounds.top,
    });
    
    return position;
  }, [reactFlowInstance]);

  // Add these drag event handlers
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setIsDraggingOver(true);
    
    // Log the data being dragged
    const nodeType = event.dataTransfer.getData('application/reactflow');
    if (nodeType) {
      console.log('[Canvas] Dragging over with node type:', nodeType);
    }
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDraggingOver(false);
  }, []);

  // Handle drop to create a new node
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);
    
    // Get the node type from the data transfer
    const nodeType = event.dataTransfer.getData('application/reactflow');
    console.log('[Canvas] Drop event with node type:', nodeType);
    
    if (!nodeType) {
      console.warn('[Canvas] No node type found in drop event');
      return;
    }
    
    // Get the flow position for the dropped node
    const position = getFlowPosition(event.clientX, event.clientY);
    console.log('[Canvas] Drop position converted:', position);
    
    // For debugging, show what we're dropping
    console.log(`[Canvas] Dropping ${nodeType} at ${position.x},${position.y}`);
    
    // Handle shape nodes
    if (nodeType.startsWith('shape-')) {
      const shape = nodeType.replace('shape-', '');
      // Convert to shapeNode:shape format expected by triggerAddNode
      triggerAddNode(`shapeNode:${shape}`, position);
    } else {
      // For non-shape nodes, use the direct node type
      triggerAddNode(nodeType, position);
    }
  }, [getFlowPosition, triggerAddNode]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodesWithUpdate}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        snapToGrid={settings.snapToGrid}
        snapGrid={[15, 15]}
        connectionMode={ConnectionMode.Loose}
        connectionLineType={ConnectionLineType.SmoothStep}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`${isDraggingOver ? 'bg-blue-50' : ''}`}
      >
        {settings.showGrid && (
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={20} 
            size={1.5} 
            color="#cccccc" 
            style={{ opacity: 0.6 }}
          />
        )}
        <Controls 
          position="bottom-right"
          showZoom={true}
          showFitView={true}
          showInteractive={true}
          className="bg-white rounded-md shadow-md border border-gray-200"
        />
        {settings.showMinimap && (
          <MiniMap 
            nodeStrokeWidth={3}
            zoomable
            pannable
            className="bg-white border border-gray-200 rounded-md shadow-md"
          />
        )}
        
        {/* Connection instruction panel */}
        {showHelp && (
          <Panel position="bottom-left" className="bg-white p-4 rounded-md shadow-md mb-4 ml-4 text-sm border border-blue-200 bg-blue-50 transition-opacity">
            <div className="flex items-center">
              <Info size={20} className="text-blue-500 mr-3" />
              <div>
                <div className="font-medium mb-1 text-blue-700 text-base">Quick Help</div>
                <div className="text-blue-600 mb-1">• Drag elements from the left panel</div>
                <div className="text-blue-600 mb-1">• Connect nodes by dragging between purple dots</div>
                <div className="text-blue-600">• Double-click elements to edit content</div>
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>
      
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            left: contextMenu.position.x + 'px',
            top: contextMenu.position.y + 'px',
            zIndex: 1000,
            backgroundColor: 'white',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            border: '1px solid #e5e7eb',
          }}
        >
          <button
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded text-sm"
            onClick={() => {
              updateNodeData(contextMenu.node.id, { isEditing: true });
              setContextMenu(null);
            }}
          >
            <span>✏️</span> Edit Node
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded text-sm"
            onClick={() => {
              // Duplicate the node
              const newNode = {...contextMenu.node};
              newNode.id = `${newNode.type}-${uuidv4()}`;
              newNode.position = {
                x: contextMenu.node.position.x + 20,
                y: contextMenu.node.position.y + 20
              };
              onNodesChange([{ type: 'add', item: newNode }]);
              setContextMenu(null);
            }}
          >
            <span>📋</span> Duplicate
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded text-sm text-red-600"
            onClick={() => {
              onNodesChange([{ type: 'remove', id: contextMenu.node.id }]);
              setContextMenu(null);
            }}
          >
            <span>🗑️</span> Delete
          </button>
        </div>
      )}
    </div>
  );
}; 