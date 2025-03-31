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
        <Handle type="source" position={Position.Top} id="source-top" data-handleid="source-top" data-nodeid={id} data-handlepos={Position.Top} style={{ background: '#555', top: -4, zIndex: 20 }} isConnectable={true} />
        <Handle type="source" position={Position.Bottom} id="source-bottom" data-handleid="source-bottom" data-nodeid={id} data-handlepos={Position.Bottom} style={{ background: '#555', bottom: -4, zIndex: 20 }} isConnectable={true} />
        <Handle type="source" position={Position.Left} id="source-left" data-handleid="source-left" data-nodeid={id} data-handlepos={Position.Left} style={{ background: '#555', left: -4, zIndex: 20 }} isConnectable={true} />
        <Handle type="source" position={Position.Right} id="source-right" data-handleid="source-right" data-nodeid={id} data-handlepos={Position.Right} style={{ background: '#555', right: -4, zIndex: 20 }} isConnectable={true} />
        <Handle type="target" position={Position.Top} id="target-top" data-handleid="target-top" data-nodeid={id} data-handlepos={Position.Top} style={{ background: '#555', top: -4, opacity: 0.6, zIndex: 20 }} isConnectable={true} />
        <Handle type="target" position={Position.Bottom} id="target-bottom" data-handleid="target-bottom" data-nodeid={id} data-handlepos={Position.Bottom} style={{ background: '#555', bottom: -4, opacity: 0.6, zIndex: 20 }} isConnectable={true} />
        <Handle type="target" position={Position.Left} id="target-left" data-handleid="target-left" data-nodeid={id} data-handlepos={Position.Left} style={{ background: '#555', left: -4, opacity: 0.6, zIndex: 20 }} isConnectable={true} />
        <Handle type="target" position={Position.Right} id="target-right" data-handleid="target-right" data-nodeid={id} data-handlepos={Position.Right} style={{ background: '#555', right: -4, opacity: 0.6, zIndex: 20 }} isConnectable={true} />
        
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