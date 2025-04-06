import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps, useUpdateNodeInternals } from 'reactflow';
import { NodeResizer, ResizeDragEvent, ResizeParams } from '@reactflow/node-resizer';
import '@reactflow/node-resizer/dist/style.css';
import { ShapeNodeData } from '../../types';

// Extended node props to include onNodeResize callback
interface ShapeNodeProps extends NodeProps<ShapeNodeData> {
  onNodeResize?: (nodeId: string, dimensions: { width: number; height: number }) => void;
}

// This component accepts both direct width/height props and data.width/data.height
export const ShapeNode: React.FC<ShapeNodeProps> = ({
  id,
  data,
  selected,
  onNodeResize,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.text || '');
  const [label, setLabel] = useState(data.label || 'Shape');
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const updateNodeInternals = useUpdateNodeInternals();
  const shapeRef = useRef<HTMLDivElement>(null);

  // Get dimensions from data or use defaults
  const nodeWidth = data.width || (data.shape === 'circle' || data.shape === 'diamond' ? 100 : 120);
  const nodeHeight = data.height || (data.shape === 'circle' || data.shape === 'diamond' ? 100 : 80);

  // Update local text state when data changes
  useEffect(() => {
    setText(data.text || '');
  }, [data.text]);

  // Update local label state when data changes
  useEffect(() => {
    setLabel(data.label || 'Shape');
  }, [data.label]);

  // Update node internals when dimensions change
  useEffect(() => {
    updateNodeInternals(id);
  }, [data.width, data.height, id, updateNodeInternals]);

  const handleResizeEnd = (_event: ResizeDragEvent | undefined, params: ResizeParams) => {
    const { width, height } = params;
    console.log(`[ShapeNode] Resized ${id} ended at:`, width, height);
    if (onNodeResize) {
      onNodeResize(id, { width, height });
    }
    updateNodeInternals(id);
  };

  const handleProps = { style: { background: '#555', width: 8, height: 8 } };
  const targetHandleOffset = { ...handleProps.style, opacity: 0.6 };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleTextEditComplete = () => {
    console.log(`[ShapeNode ${id}] Completing text edit:`, text);
    setIsEditing(false);
    data.onUpdate?.(id, { text });
  };

  const handleTextClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`[ShapeNode ${id}] Text clicked, setting isEditing to true`);
    setIsEditing(true);
  };

  const handleTextKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextEditComplete();
    }
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(e.target.value);
  };

  const handleLabelEditComplete = () => {
    console.log(`[ShapeNode ${id}] Completing label edit:`, label);
    setIsEditingLabel(false);
    data.onUpdate?.(id, { label });
  };

  const handleLabelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`[ShapeNode ${id}] Label clicked, setting isEditingLabel to true`);
    setIsEditingLabel(true);
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLabelEditComplete();
    }
  };

  const renderTextContent = () => {
    const textStyle = { 
      fontSize: `${data.fontSize || 12}px`,
      width: '90%',
      height: '90%',
      overflowWrap: 'break-word' as const,
      textAlign: 'center' as const,
      margin: 'auto',
      zIndex: 10,
    };
    
    if (isEditing) {
      return (
        <textarea
          value={text}
          onChange={handleTextChange}
          onBlur={handleTextEditComplete}
          onKeyDown={handleTextKeyDown}
          autoFocus
          onClick={(e) => e.stopPropagation()}
          className="bg-transparent text-center focus:outline-none w-full h-full p-1 nodrag resize-none"
          style={textStyle}
        />
      );
    } else {
      return (
        <div 
          className="text-center p-1 cursor-text w-full h-full flex items-center justify-center nodrag"
          onClick={handleTextClick}
          style={textStyle}
        >
          {text ? text.split('\n').map((line, index) => (
            <React.Fragment key={index}>{line}<br /></React.Fragment>
          )) : 'Text'}
        </div>
      );
    }
  };

  const renderShape = () => {
    const baseStyle: React.CSSProperties = {
      backgroundColor: data.color || '#ffffff',
      borderColor: data.borderColor || '#cccccc',
      borderWidth: '1px',
      transition: 'none',
      width: `${nodeWidth}px`,
      height: `${nodeHeight}px`,
      boxSizing: 'border-box',
      position: 'relative',
    };

    const commonClasses = `flex items-center justify-center relative ${ 
                           selected ? '' :
                           isHovered ? 'shadow-md' : ''
                         }`;

    // Handle styles with improved positioning
    const handleStyle = { 
      background: '#555', 
      width: 8, 
      height: 8, 
      zIndex: 20,
      visibility: selected ? 'visible' as const : 'hidden' as const,
    };
    
    const targetStyle = {
      ...handleStyle,
      opacity: 0.6,
    };

    // Common handles for all shapes
    const renderHandles = () => (
      <>
        <Handle type="source" position={Position.Top} id="handle-top" style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.8 }} isConnectable={true} />
        <Handle type="source" position={Position.Bottom} id="handle-bottom" style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.8 }} isConnectable={true} />
        <Handle type="source" position={Position.Left} id="handle-left" style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.8 }} isConnectable={true} />
        <Handle type="source" position={Position.Right} id="handle-right" style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.8 }} isConnectable={true} />
        
        <Handle type="target" position={Position.Top} id="handle-top" style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.3 }} isConnectable={true} />
        <Handle type="target" position={Position.Bottom} id="handle-bottom" style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.3 }} isConnectable={true} />
        <Handle type="target" position={Position.Left} id="handle-left" style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.3 }} isConnectable={true} />
        <Handle type="target" position={Position.Right} id="handle-right" style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.3 }} isConnectable={true} />
      </>
    );

    switch (data.shape) {
      case 'circle':
        return (
          <div 
            ref={shapeRef}
            className={`${commonClasses} rounded-full border`}
            style={{ ...baseStyle, width: `${Math.min(nodeWidth, nodeHeight)}px`, height: `${Math.min(nodeWidth, nodeHeight)}px` }}
          >
            {renderHandles()}
            {renderTextContent()}
          </div>
        );
      case 'triangle':
        return (
          <div 
             ref={shapeRef}
             className="relative"
             style={{ ...baseStyle, background: 'none', borderColor: 'transparent' }}
          >
            {renderHandles()}
            <div
              className={`${commonClasses} absolute inset-0`} 
              style={{
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                backgroundColor: data.color || '#ffffff',
                border: `1px solid ${data.borderColor || '#cccccc'}`,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center pt-4"> 
              {renderTextContent()}
            </div>
          </div>
        );
      case 'diamond':
        return (
          <div 
            ref={shapeRef}
            className={`${commonClasses}`} 
            style={baseStyle}
          >
            {renderHandles()}
            <div 
              className="absolute inset-0 border"
              style={{ 
                backgroundColor: data.color || '#ffffff', 
                borderColor: data.borderColor || '#cccccc',
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
              }} 
            />
            <div className="absolute inset-0 flex items-center justify-center">
              {renderTextContent()}
            </div>
          </div>
        );
      case 'cylinder':
        return (
          <div 
            ref={shapeRef}
            className={commonClasses}
            style={baseStyle}
          >
            {renderHandles()}
            <div className="absolute inset-0 flex flex-col">
              {/* Top ellipse */}
              <div 
                className="h-[15%] relative border-t border-l border-r rounded-t-full"
                style={{ 
                  backgroundColor: data.color || '#ffffff',
                  borderColor: data.borderColor || '#cccccc'
                }}
              />
              {/* Middle section */}
              <div 
                className="flex-grow border-l border-r"
                style={{ 
                  backgroundColor: data.color || '#ffffff',
                  borderColor: data.borderColor || '#cccccc'
                }}
              />
              {/* Bottom ellipse */}
              <div 
                className="h-[15%] relative border-b border-l border-r rounded-b-full"
                style={{ 
                  backgroundColor: data.color || '#ffffff',
                  borderColor: data.borderColor || '#cccccc'
                }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              {renderTextContent()}
            </div>
          </div>
        );
      case 'process':
        return (
          <div 
            ref={shapeRef}
            className={`${commonClasses} rounded-md border`}
            style={baseStyle}
          >
            {renderHandles()}
            {renderTextContent()}
          </div>
        );
      case 'rectangle':
      default:
        return (
          <div 
            ref={shapeRef}
            className={`${commonClasses} border`}
            style={baseStyle}
          >
            {renderHandles()}
            {renderTextContent()}
          </div>
        );
    }
  };

  return (
    <div 
      className="relative shape-node-wrapper group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <NodeResizer 
        minWidth={80}
        minHeight={40}
        isVisible={selected} 
        lineClassName="border-blue-400"
        handleClassName="h-3 w-3 bg-white border-2 rounded border-blue-400"
        onResizeEnd={handleResizeEnd}
      />

      <div 
        className={`absolute -top-5 left-1/2 transform -translate-x-1/2 w-max px-1 rounded z-10 transition-opacity duration-150 ${isEditingLabel ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
      >
        {isEditingLabel ? (
            <input
              value={label}
              onChange={handleLabelChange}
              onBlur={handleLabelEditComplete}
              onKeyDown={handleLabelKeyDown}
              autoFocus
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-medium bg-white border border-blue-300 rounded px-1 shadow-sm text-center nodrag"
              size={Math.max(label.length, 5)}
            />
        ) : (
          <div
            className="text-xs font-medium text-gray-700 bg-white bg-opacity-80 rounded px-1 cursor-pointer nodrag"
            onClick={handleLabelClick}
          >
            {label}
          </div>
        )}
      </div>
      {renderShape()}
    </div>
  );
};