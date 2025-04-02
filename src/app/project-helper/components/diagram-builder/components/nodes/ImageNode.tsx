import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ImageNodeData } from '../../types';
import { Image } from 'lucide-react';

interface ImageNodeProps extends NodeProps {
  data: ImageNodeData;
}

export const ImageNode: React.FC<ImageNodeProps> = ({
  id,
  data,
  selected
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [caption, setCaption] = useState(data.caption || '');
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [label, setLabel] = useState(data.label || 'Image');
  const [isEditingLabel, setIsEditingLabel] = useState(false);

  // Update local state when data changes
  useEffect(() => {
    setCaption(data.caption || '');
    setLabel(data.label || 'Image');
  }, [data.caption, data.label]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        data.onUpdate?.(id, { imageUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProps = { style: { background: '#555', width: 8, height: 8 } };
  const targetHandleOffset = { ...handleProps.style, opacity: 0.6 };

  return (
    <div 
      className="relative image-node group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Label Editing */}
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

      {/* Main Image Content */}
      <div
        className={`flex flex-col items-center p-1 border rounded-md ${ 
          selected ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-1' :
          isHovered ? 'border-blue-300 shadow-md' : 
          'border-gray-200'
        }`}
      >
        {/* Source handles - BLUE for outgoing connections */}
        <Handle type="source" position={Position.Top} id="source-top" style={{ background: '#3498db', width: 8, height: 8 }} isConnectable={true} />
        <Handle type="source" position={Position.Bottom} id="source-bottom" style={{ background: '#3498db', width: 8, height: 8 }} isConnectable={true} />
        <Handle type="source" position={Position.Left} id="source-left" style={{ background: '#3498db', width: 8, height: 8 }} isConnectable={true} />
        <Handle type="source" position={Position.Right} id="source-right" style={{ background: '#3498db', width: 8, height: 8 }} isConnectable={true} />
        
        {/* Target handles - GREEN for incoming connections */}
        <Handle type="target" position={Position.Top} id="target-top" style={{ background: '#2ecc71', width: 8, height: 8, opacity: 0.8 }} isConnectable={true} />
        <Handle type="target" position={Position.Bottom} id="target-bottom" style={{ background: '#2ecc71', width: 8, height: 8, opacity: 0.8 }} isConnectable={true} />
        <Handle type="target" position={Position.Left} id="target-left" style={{ background: '#2ecc71', width: 8, height: 8, opacity: 0.8 }} isConnectable={true} />
        <Handle type="target" position={Position.Right} id="target-right" style={{ background: '#2ecc71', width: 8, height: 8, opacity: 0.8 }} isConnectable={true} />
        
        <img 
          src={data.imageUrl || "/api/placeholder/200/150"}
          alt={data.alt || "Image"}
          style={{ 
            width: data.width || 200, 
            height: data.height || 150,
            objectFit: 'contain'
          }}
          className="block rounded"
          onError={(e) => (e.currentTarget.src = "/api/placeholder/200/150")}
        />
        {isEditingCaption ? (
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            onBlur={() => {
              setIsEditingCaption(false);
              data.onUpdate?.(id, { caption });
            }}
            onKeyDown={(e) => { 
              if (e.key === 'Enter') { 
                setIsEditingCaption(false); 
                data.onUpdate?.(id, { caption });
              } 
            }}
            onClick={(e) => e.stopPropagation()}
            className="mt-2 p-1 text-sm text-center w-full border-b border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent nodrag"
            placeholder="Add caption..."
            autoFocus
          />
        ) : (
          <div 
            className="mt-2 text-sm text-center text-gray-600 cursor-pointer min-h-[24px] nodrag"
            onClick={(e) => { 
              e.stopPropagation();
              setIsEditingCaption(true); 
            }}
          >
            {caption || <span className="text-gray-400">Add caption...</span>}
          </div>
        )}
      </div>
    </div>
  );
};