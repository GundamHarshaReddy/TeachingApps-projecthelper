import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ImageNodeData } from '../../types';
import { Upload } from 'lucide-react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update local state when data changes
  useEffect(() => {
    setCaption(data.caption || '');
    setLabel(data.label || 'Image');
  }, [data.caption, data.label]);

  // Log when component mounts or updates
  useEffect(() => {
    console.log('[ImageNode] Node rendered with data:', data);
  }, [data]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[ImageNode] File input change detected');
    const files = event.target.files;
    if (!files || files.length === 0) {
      console.log('[ImageNode] No files selected');
      return;
    }
    
    const file = files[0];
    console.log('[ImageNode] File selected:', file.name, file.type, file.size);
    
    if (!file.type.startsWith('image/')) {
      console.error('[ImageNode] Selected file is not an image:', file.type);
      alert('Please select an image file (JPEG, PNG, GIF, etc.)');
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (!e.target || typeof e.target.result !== 'string') {
        console.error('[ImageNode] FileReader did not return a valid result');
        return;
      }
      
      const imageUrl = e.target.result;
      console.log('[ImageNode] Image loaded, updating node data with new URL');
      
      if (data.onUpdate) {
        data.onUpdate(id, { imageUrl });
      } else {
        console.error('[ImageNode] onUpdate function not available in data');
      }
    };
    
    reader.onerror = (error) => {
      console.error('[ImageNode] Error reading file:', error);
      alert('There was an error reading the selected image. Please try another file.');
    };
    
    reader.readAsDataURL(file);
  };

  const triggerFileInput = (e: React.MouseEvent) => {
    console.log('[ImageNode] Trigger file input clicked');
    // Prevent event from reaching the node/canvas selection
    e.preventDefault();
    e.stopPropagation();
    
    // Ensure the file input exists and click it
    if (fileInputRef.current) {
      console.log('[ImageNode] Clicking file input');
      fileInputRef.current.click();
    } else {
      console.error('[ImageNode] File input ref is null');
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
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleImageUpload} 
        style={{ display: 'none' }} 
        accept="image/*"
        data-testid="image-file-input"
      />

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
        
        {!data.imageUrl ? (
          // Image upload placeholder when no image is present
          <button 
            className="flex flex-col items-center justify-center w-full h-[150px] border-2 border-dashed border-gray-300 rounded-md bg-gray-50 cursor-pointer nodrag"
            onClick={triggerFileInput}
            style={{ 
              width: data.width || 200, 
              height: data.height || 150,
            }}
            type="button"
          >
            <Upload className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Click to upload image</p>
            <p className="text-xs text-gray-400 mt-1">Supports: JPG, PNG, GIF</p>
          </button>
        ) : (
          // Image display when an image is present
          <div className="relative group/image">
            <img 
              src={data.imageUrl}
              alt={data.alt || "Image"}
              style={{ 
                width: data.width || 200, 
                height: data.height || 150,
                objectFit: 'contain'
              }}
              className="block rounded nodrag"
              onError={(e) => {
                console.error('[ImageNode] Image error, using fallback');
                // Fallback SVG as data URI if the image fails to load
                const fallbackSvg = `
                  <svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
                    <rect width="200" height="150" fill="#f1f5f9"/>
                    <text x="100" y="75" font-family="Arial" font-size="15" text-anchor="middle" dominant-baseline="middle" fill="#94a3b8">Image not available</text>
                    <text x="100" y="95" font-family="Arial" font-size="12" text-anchor="middle" dominant-baseline="middle" fill="#94a3b8">Click to upload</text>
                  </svg>
                `;
                const fallbackUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(fallbackSvg.trim())}`;
                (e.target as HTMLImageElement).src = fallbackUrl;
                
                // Notify the parent that the image URL is invalid
                setTimeout(() => {
                  data.onUpdate?.(id, { imageUrl: undefined });
                }, 0);
              }}
            />
            <button 
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 cursor-pointer nodrag"
              onClick={triggerFileInput}
              type="button"
            >
              <div className="text-white bg-gray-800 bg-opacity-75 rounded-full p-2">
                <Upload className="h-5 w-5" />
              </div>
            </button>
          </div>
        )}
        
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