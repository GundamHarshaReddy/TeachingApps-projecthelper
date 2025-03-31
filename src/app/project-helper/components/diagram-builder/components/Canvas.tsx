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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CanvasNode, FlowNode, ShapeNode, TextNode, ImageNode, CodeNode, DatabaseNode, MindMapNode } from './nodes';
import { DiagramBuilderProps, ShapeNodeData } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { NodeContextMenu } from './NodeContextMenu';

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
}) => {
  const reactFlowInstance = useReactFlow();
  const [contextMenu, setContextMenu] = useState<{
    node: Node;
    position: { x: number; y: number };
  } | null>(null);

  // Handle node click
  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
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
      onUpdate: updateNodeData
    }
  }));

  // Handle edge connections
  const handleConnect = useCallback((connection: Connection) => {
    console.log("***** [Canvas] handleConnect TRIGGERED *****", JSON.stringify(connection, null, 2));
    console.log("[Canvas] handleConnect received connection:", JSON.stringify(connection, null, 2));
    // Validate connection
    if (!connection.source || !connection.target) {
      console.warn('[Canvas] Invalid connection: missing source or target');
      return;
    }

    // Prevent self-connections
    if (connection.source === connection.target) {
      console.warn('Cannot connect node to itself');
      return;
    }

    // Check if connection already exists
    const connectionExists = edges.some(
      edge => edge.source === connection.source && edge.target === connection.target
    );

    if (connectionExists) {
      console.warn('Connection already exists');
      return;
    }

    // Pass the original connection object up to the parent (DiagramBuilder)
    onConnect(connection);
  }, [onConnect, edges]);

  return (
    <div className="w-full h-full" style={{ width: '100%', height: '100vh' }}>
      <ReactFlow
        nodes={nodesWithUpdate}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50"
        style={{ width: '100%', height: '100%' }}
        connectionMode={ConnectionMode.Strict}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#555', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: '#555',
          },
        }}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        snapToGrid={true}
        snapGrid={[15, 15]}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Background />
        <Controls />
        <MiniMap />
        <Panel position="top-right" className="flex gap-2 bg-white p-1 rounded shadow">
          <button onClick={triggerUndo} title="Undo (Ctrl+Z)">
            Undo
          </button>
          <button onClick={triggerRedo} title="Redo (Ctrl+Y)">
            Redo
          </button>
        </Panel>
      </ReactFlow>
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            left: contextMenu.position.x + 'px',
            top: contextMenu.position.y + 'px',
            zIndex: 1000,
            backgroundColor: 'white',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          <button
            className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 rounded text-sm"
            onClick={() => {
              updateNodeData(contextMenu.node.id, { isEditing: true });
              setContextMenu(null);
            }}
          >
            <span>✏️</span> Edit
          </button>
          <button
            className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 rounded text-sm text-red-600"
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