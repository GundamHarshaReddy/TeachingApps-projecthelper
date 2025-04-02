import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Database, Layers, GitBranch, FileText } from 'lucide-react';
import { FlowNodeData } from '../../types';

// Define props extending NodeProps
interface FlowNodeProps extends NodeProps {
  data: FlowNodeData; // Assuming FlowNodeData has the correct fields
  // selected is inherited from NodeProps
}

// Use the updated props interface
export const FlowNode: React.FC<FlowNodeProps> = ({
  id, 
  data, 
  selected 
}) => {
  const [content, setContent] = useState(data.content || '');
  const [label, setLabel] = useState(data.label || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [nodeColor, setNodeColor] = useState(data.color || '#e6f7ff');
  
  const getNodeShape = () => {
    // Use data.role if available, otherwise fallback to id check
    const role = data.role || '';
    if (role === 'input') return 'rounded-l-lg';
    if (role === 'process') return 'rounded-md';
    if (role === 'decision') return 'rounded-full'; // Changed for visual distinction
    if (role === 'output') return 'rounded-r-lg';
    
    // Fallback based on id if role is not set (less reliable)
    if (id.includes('input')) return 'rounded-l-lg';
    if (id.includes('process')) return 'rounded-md';
    if (id.includes('decision')) return 'rounded-full';
    if (id.includes('output')) return 'rounded-r-lg';
    return 'rounded-md';
  };

  const getNodeIcon = () => {
    const role = data.role || '';
    if (role === 'input') return <Database className="w-4 h-4" />;
    if (role === 'process') return <Layers className="w-4 h-4" />;
    if (role === 'decision') return <GitBranch className="w-4 h-4" />;
    if (role === 'output') return <FileText className="w-4 h-4" />;
    
    // Fallback based on id
    if (id.includes('input')) return <Database className="w-4 h-4" />;
    if (id.includes('process')) return <Layers className="w-4 h-4" />;
    if (id.includes('decision')) return <GitBranch className="w-4 h-4" />;
    if (id.includes('output')) return <FileText className="w-4 h-4" />;
    return null;
  };

  return (
    <div
      className={`p-3 border relative ${getNodeShape()} ${ 
        selected ? 'border-blue-500 shadow-lg' : // Use non-optional selected
        isHovered ? 'border-blue-300 shadow-md' : 
        'border-gray-300'
      } transition-all duration-200`}
      style={{ 
        width: 180, 
        minHeight: 100, 
        backgroundColor: nodeColor,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Bidirectional handles - can be used as both source and target */}
      <Handle type="source" position={Position.Top} id="handle-top" style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.8 }} isConnectable={true} />
      <Handle type="source" position={Position.Bottom} id="handle-bottom" style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.8 }} isConnectable={true} />
      <Handle type="source" position={Position.Left} id="handle-left" style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.8 }} isConnectable={true} />
      <Handle type="source" position={Position.Right} id="handle-right" style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.8 }} isConnectable={true} />
      
      {/* Same handles but as targets (invisible) */}
      <Handle type="target" position={Position.Top} id="handle-top" style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.3 }} isConnectable={true} />
      <Handle type="target" position={Position.Bottom} id="handle-bottom" style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.3 }} isConnectable={true} />
      <Handle type="target" position={Position.Left} id="handle-left" style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.3 }} isConnectable={true} />
      <Handle type="target" position={Position.Right} id="handle-right" style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.3 }} isConnectable={true} />
      
      <div className="font-bold text-sm mb-2 flex items-center">
        {getNodeIcon()}
        {isEditingLabel ? (
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={() => {
              setIsEditingLabel(false);
              data.label = label;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsEditingLabel(false);
                data.label = label;
              }
            }}
            autoFocus
            className="ml-1 text-sm font-bold bg-transparent focus:outline-none border-b border-blue-300 w-full"
          />
        ) : (
          <span 
            className="ml-1 cursor-pointer" 
            onClick={(e) => { 
              e.stopPropagation(); // Stop event propagation
              setIsEditingLabel(true); 
            }}
          >
            {label}
          </span>
        )}
      </div>
      {isEditing ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={() => {
            setIsEditing(false);
            data.content = content;
          }}
          autoFocus
          className="w-full h-16 text-xs p-2 border rounded focus:ring-2 focus:ring-blue-300"
        />
      ) : (
        <div 
          className="text-xs p-2 cursor-pointer h-16 overflow-auto hover:bg-opacity-50 hover:bg-gray-50 rounded" 
          onClick={(e) => { 
            e.stopPropagation(); // Stop event propagation
            setIsEditing(true); 
          }}
        >
          {content || 'Click to configure...'}
        </div>
      )}
    </div>
  );
};