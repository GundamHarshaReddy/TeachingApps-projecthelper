import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { MessageSquare } from 'lucide-react';
import { CommentData } from '../../types';

interface CanvasNodeProps extends NodeProps {
  data: {
    label: string;
    content: string;
    comments?: CommentData[];
    theme?: string;
    links?: string[];
    images?: string[];
    color?: string;
    icon?: string;
  };
}

export const CanvasNode: React.FC<CanvasNodeProps> = ({
  id,
  data,
  selected
}) => {
  const [content, setContent] = useState(data.content || '');
  const [label, setLabel] = useState(data.label || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [nodeColor, setNodeColor] = useState(data.color || '#ffffff');
  const hasComments = data.comments && data.comments.length > 0;

  return (
    <div 
      className={`p-3 rounded-md border relative ${
        selected ? 'border-blue-500 shadow-lg' : 
        isHovered ? 'border-blue-300 shadow-md' : 
        'border-gray-300'
      } transition-all duration-200 ${data.theme || ''}`}
      style={{ 
        width: 220, 
        minHeight: 130, 
        backgroundColor: nodeColor,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Bidirectional handles - can be used as both source and target */}
      <Handle
        type="source"
        position={Position.Top}
        id="handle-top"
        style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.8 }}
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="handle-bottom"
        style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.8 }}
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="handle-left"
        style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.8 }}
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="handle-right"
        style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.8 }}
        isConnectable={true}
      />
      
      {/* Same handles but as targets (invisible) */}
      <Handle
        type="target"
        position={Position.Top}
        id="handle-top"
        style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.3 }}
        isConnectable={true}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="handle-bottom"
        style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.3 }}
        isConnectable={true}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="handle-left"
        style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.3 }}
        isConnectable={true}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="handle-right"
        style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.3 }}
        isConnectable={true}
      />
      
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
          className="w-full text-sm font-bold mb-2 text-blue-600 bg-transparent focus:outline-none border-b border-blue-300"
        />
      ) : (
        <div 
          className="font-bold text-sm mb-2 text-blue-600 cursor-pointer"
          onClick={(e) => { 
            e.stopPropagation();
            setIsEditingLabel(true); 
          }}
        >
          {label}
        </div>
      )}
      
      {isEditing ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={() => {
            setIsEditing(false);
            data.content = content;
          }}
          autoFocus
          className="w-full h-24 text-sm p-2 border rounded focus:ring-2 focus:ring-blue-300"
        />
      ) : (
        <div 
          className="text-sm p-2 cursor-pointer h-24 overflow-auto hover:bg-gray-50 hover:bg-opacity-50 rounded" 
          onClick={(e) => { 
            e.stopPropagation();
            setIsEditing(true); 
          }}
        >
          {content || 'Click to add content...'}
        </div>
      )}
      {hasComments && (
        <div className="absolute top-2 right-2">
          <div 
            className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 flex items-center cursor-pointer"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageSquare size={12} className="mr-1" />
            {data.comments?.length}
          </div>
        </div>
      )}
      {showComments && hasComments && (
        <div className="mt-2 border-t pt-2">
          <div className="text-xs font-medium mb-1">Comments:</div>
          <div className="max-h-32 overflow-y-auto">
            {data.comments?.map(comment => (
              <div key={comment.id} className="bg-gray-50 rounded p-1 mb-1 text-xs">
                <div className="font-medium">{comment.username}</div>
                <div>{comment.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};