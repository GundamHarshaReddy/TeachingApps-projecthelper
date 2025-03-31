import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Brain, Plus, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { MindMapNodeData } from '../../types';

interface MindMapItem {
  id: string;
  text: string;
  children: MindMapItem[];
  isExpanded: boolean;
  color?: string;
}

interface MindMapNodeProps extends NodeProps {
  data: MindMapNodeData;
}

export const MindMapNode: React.FC<MindMapNodeProps> = ({
  id,
  data,
  selected
}) => {
  const [items, setItems] = useState<MindMapItem[]>(data.items || []);
  const [isHovered, setIsHovered] = useState(false);
  const [nodeColor, setNodeColor] = useState(data.color || '#f8fafc');

  // Update local state when data changes
  useEffect(() => {
    setItems(data.items || []);
    setNodeColor(data.color || '#f8fafc');
  }, [data.items, data.color]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleAddItem = (parentId?: string) => {
    const newItem: MindMapItem = {
      id: generateId(),
      text: 'New Item',
      children: [],
      isExpanded: true,
      color: '#e2e8f0'
    };

    let newItems: MindMapItem[];
    if (parentId) {
      newItems = addItemToParent(items, parentId, newItem);
    } else {
      newItems = [...items, newItem];
    }
    setItems(newItems);
    data.onUpdate?.(id, { items: newItems });
  };

  const addItemToParent = (items: MindMapItem[], parentId: string, newItem: MindMapItem): MindMapItem[] => {
    return items.map(item => {
      if (item.id === parentId) {
        return {
          ...item,
          children: [...item.children, newItem]
        };
      }
      return {
        ...item,
        children: addItemToParent(item.children, parentId, newItem)
      };
    });
  };

  const handleDeleteItem = (itemId: string) => {
    const newItems = removeItem(items, itemId);
    setItems(newItems);
    data.onUpdate?.(id, { items: newItems });
  };

  const removeItem = (items: MindMapItem[], itemId: string): MindMapItem[] => {
    return items.filter(item => {
      if (item.id === itemId) return false;
      item.children = removeItem(item.children, itemId);
      return true;
    });
  };

  const handleToggleExpand = (itemId: string) => {
    const newItems = toggleItemExpand(items, itemId);
    setItems(newItems);
    data.onUpdate?.(id, { items: newItems });
  };

  const toggleItemExpand = (items: MindMapItem[], itemId: string): MindMapItem[] => {
    return items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          isExpanded: !item.isExpanded
        };
      }
      return {
        ...item,
        children: toggleItemExpand(item.children, itemId)
      };
    });
  };

  const handleTextChange = (itemId: string, newText: string) => {
    const newItems = updateItemText(items, itemId, newText);
    setItems(newItems);
    data.onUpdate?.(id, { items: newItems });
  };

  const updateItemText = (items: MindMapItem[], itemId: string, newText: string): MindMapItem[] => {
    return items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          text: newText
        };
      }
      return {
        ...item,
        children: updateItemText(item.children, itemId, newText)
      };
    });
  };

  const renderMindMapItem = (item: MindMapItem, level: number = 0) => {
    const hasChildren = item.children.length > 0;
    const paddingLeft = `${level * 20}px`;

    return (
      <div key={item.id} style={{ paddingLeft }}>
        <div className="flex items-center gap-2 py-1">
          {hasChildren && (
            <button
              onClick={() => handleToggleExpand(item.id)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {item.isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
          )}
          <input
            type="text"
            value={item.text}
            onChange={(e) => handleTextChange(item.id, e.target.value)}
            className="flex-1 bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none text-sm"
            placeholder="Enter text"
          />
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleAddItem(item.id)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Plus className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={() => handleDeleteItem(item.id)}
              className="p-1 hover:bg-gray-100 rounded text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        {item.isExpanded && hasChildren && (
          <div className="ml-6">
            {item.children.map(child => renderMindMapItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`p-4 rounded-lg border relative ${
        selected ? 'border-blue-500 shadow-lg' : 
        isHovered ? 'border-blue-300 shadow-md' : 
        'border-gray-300'
      } transition-all duration-200`}
      style={{ 
        width: 300, 
        minHeight: 200, 
        backgroundColor: nodeColor,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Connection handles */}
      <Handle type="source" position={Position.Top} id="source-top" data-handleid="source-top" data-nodeid={id} data-handlepos={Position.Top} style={{ background: '#555', width: 8, height: 8, zIndex: 20 }} isConnectable={true} />
      <Handle type="source" position={Position.Bottom} id="source-bottom" data-handleid="source-bottom" data-nodeid={id} data-handlepos={Position.Bottom} style={{ background: '#555', width: 8, height: 8, zIndex: 20 }} isConnectable={true} />
      <Handle type="source" position={Position.Left} id="source-left" data-handleid="source-left" data-nodeid={id} data-handlepos={Position.Left} style={{ background: '#555', width: 8, height: 8, zIndex: 20 }} isConnectable={true} />
      <Handle type="source" position={Position.Right} id="source-right" data-handleid="source-right" data-nodeid={id} data-handlepos={Position.Right} style={{ background: '#555', width: 8, height: 8, zIndex: 20 }} isConnectable={true} />
      
      {/* Target handles */}
      <Handle type="target" position={Position.Top} id="target-top" data-handleid="target-top" data-nodeid={id} data-handlepos={Position.Top} style={{ background: '#555', width: 8, height: 8, top: -4, zIndex: 20 }} isConnectable={true} />
      <Handle type="target" position={Position.Bottom} id="target-bottom" data-handleid="target-bottom" data-nodeid={id} data-handlepos={Position.Bottom} style={{ background: '#555', width: 8, height: 8, bottom: -4, zIndex: 20 }} isConnectable={true} />
      <Handle type="target" position={Position.Left} id="target-left" data-handleid="target-left" data-nodeid={id} data-handlepos={Position.Left} style={{ background: '#555', width: 8, height: 8, left: -4, zIndex: 20 }} isConnectable={true} />
      <Handle type="target" position={Position.Right} id="target-right" data-handleid="target-right" data-nodeid={id} data-handlepos={Position.Right} style={{ background: '#555', width: 8, height: 8, right: -4, zIndex: 20 }} isConnectable={true} />

      {/* Mind map header */}
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-semibold text-gray-800">Mind Map</h3>
      </div>

      {/* Mind map content */}
      <div className="space-y-2">
        {items.map(item => renderMindMapItem(item))}
      </div>

      {/* Add root item button */}
      <button
        onClick={() => handleAddItem()}
        className="mt-4 w-full py-2 text-sm text-purple-500 hover:text-purple-600 border border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Root Item
      </button>
    </div>
  );
}; 