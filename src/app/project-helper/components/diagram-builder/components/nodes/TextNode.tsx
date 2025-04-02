import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { TextNodeData } from '../../types';

interface TextNodeProps extends NodeProps {
  data: TextNodeData;
}

export const TextNode: React.FC<TextNodeProps> = ({
  id,
  data,
  selected
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.text || 'Text label');
  const [label, setLabel] = useState(data.label || 'Text');
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const textStyle = {
    fontSize: `${data.fontSize || 14}px`, 
    color: data.textColor || '#000000',
    backgroundColor: data.backgroundColor || 'transparent',
    padding: '4px',
  };

  return (
    <div 
      className="relative text-node group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`absolute -top-5 left-1/2 transform -translate-x-1/2 w-max px-1 rounded z-10 transition-opacity duration-150 ${isEditingLabel ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
      >
        {isEditingLabel ? (
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={() => { 
              setIsEditingLabel(false); 
              data.onUpdate?.(id, { label });
            }}
            onKeyDown={(e) => { 
              if (e.key === 'Enter') { 
                setIsEditingLabel(false); 
                data.onUpdate?.(id, { label });
              } 
            }}
            autoFocus
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-medium bg-white border border-blue-300 rounded px-1 shadow-sm text-center nodrag"
            size={Math.max(label.length, 5)}
          />
        ) : (
          <div
            className="text-xs font-medium text-gray-700 bg-white bg-opacity-80 rounded px-1 cursor-pointer nodrag"
            onClick={(e) => { 
              e.stopPropagation();
              setIsEditingLabel(true); 
            }}
          >
            {label}
          </div>
        )}
      </div>

      <div
        className={`relative ${selected ? 'ring-2 ring-blue-500' : 
                   isHovered ? 'ring-1 ring-blue-200' : ''}`}
        style={textStyle}
      >
        {/* Bidirectional handles - can be used as both source and target */}
        <Handle type="source" position={Position.Top} id="handle-top" style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.8 }} isConnectable={true} />
        <Handle type="source" position={Position.Bottom} id="handle-bottom" style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.8 }} isConnectable={true} />
        <Handle type="source" position={Position.Left} id="handle-left" style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.8 }} isConnectable={true} />
        <Handle type="source" position={Position.Right} id="handle-right" style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.8 }} isConnectable={true} />
        
        {/* Same handles but as targets with lower opacity */}
        <Handle type="target" position={Position.Top} id="handle-top" style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.3 }} isConnectable={true} />
        <Handle type="target" position={Position.Bottom} id="handle-bottom" style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.3 }} isConnectable={true} />
        <Handle type="target" position={Position.Left} id="handle-left" style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.3 }} isConnectable={true} />
        <Handle type="target" position={Position.Right} id="handle-right" style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.3 }} isConnectable={true} />
        
        {isEditing ? (
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={() => {
              setIsEditing(false);
              data.onUpdate?.(id, { text });
            }}
            onKeyDown={(e) => { 
              if (e.key === 'Enter') { 
                setIsEditing(false); 
                data.onUpdate?.(id, { text });
              } 
            }}
            autoFocus
            onClick={(e) => e.stopPropagation()}
            className="bg-transparent focus:outline-none border-b border-blue-300 w-full nodrag"
            style={{ fontSize: 'inherit', color: 'inherit' }}
          />
        ) : (
          <div 
            onClick={(e) => { 
              e.stopPropagation();
              setIsEditing(true); 
            }}
            className="cursor-text min-w-[50px] nodrag"
            style={{ fontSize: 'inherit', color: 'inherit' }}
          >
            {text}
          </div>
        )}
      </div>
    </div>
  );
};