import React from 'react';
import { Node } from 'reactflow';
import { Edit, Trash2 } from 'lucide-react';

interface NodeContextMenuProps {
  node: Node;
  onEdit: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

export const NodeContextMenu: React.FC<NodeContextMenuProps> = ({
  node,
  onEdit,
  onDelete,
  onClose,
  position,
}) => {
  return (
    <div
      className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <button
        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
        onClick={() => onEdit(node.id)}
      >
        <Edit className="w-4 h-4" />
        <span>Edit</span>
      </button>
      <button
        className="w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600 flex items-center gap-2"
        onClick={() => onDelete(node.id)}
      >
        <Trash2 className="w-4 h-4" />
        <span>Delete</span>
      </button>
    </div>
  );
}; 