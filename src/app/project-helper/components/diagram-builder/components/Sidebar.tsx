import React from 'react';
import { 
  LayoutGrid, 
  Workflow,
  Square, 
  Type, 
  Image,
  MessageSquare,
  History,
  Save,
  Download,
  Trash2,
  Undo2,
  Redo2,
  Maximize2,
  Code,
  Database,
  Brain
} from 'lucide-react';

interface SidebarProps {
  onAddNode: (type: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onExport: () => void;
  onClear: () => void;
  onShowHistory: () => void;
  onShowComments: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onLoadTemplate?: (templateName: 'businessModelCanvas' | 'leanCanvas') => void;
  onContinueToAssistance?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onAddNode,
  onUndo,
  onRedo,
  onSave,
  onExport,
  onClear,
  onShowHistory,
  onShowComments,
  canUndo,
  canRedo,
  onLoadTemplate,
  onContinueToAssistance,
}) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col gap-4">
      {/* Node Types */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Node Types</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onAddNode('canvasNode')}
            className="flex items-center gap-2 p-2 text-sm border rounded hover:bg-gray-50"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Section</span>
          </button>
          <button
            onClick={() => onAddNode('flowNode')}
            className="flex items-center gap-2 p-2 text-sm border rounded hover:bg-gray-50"
          >
            <Workflow className="w-4 h-4" />
            <span>Flow</span>
          </button>
          <button
            onClick={() => onAddNode('shapeNode')}
            className="flex items-center gap-2 p-2 text-sm border rounded hover:bg-gray-50"
          >
            <Square className="w-4 h-4" />
            <span>Shape</span>
          </button>
          <button
            onClick={() => onAddNode('textNode')}
            className="flex items-center gap-2 p-2 text-sm border rounded hover:bg-gray-50"
          >
            <Type className="w-4 h-4" />
            <span>Text</span>
          </button>
          <button
            onClick={() => onAddNode('imageNode')}
            className="flex items-center gap-2 p-2 text-sm border rounded hover:bg-gray-50"
          >
            <Image className="w-4 h-4" />
            <span>Image</span>
          </button>
          <button
            onClick={() => onAddNode('codeNode')}
            className="flex items-center gap-2 p-2 text-sm border rounded hover:bg-gray-50"
          >
            <Code className="w-4 h-4" />
            <span>Code</span>
          </button>
          <button
            onClick={() => onAddNode('databaseNode')}
            className="flex items-center gap-2 p-2 text-sm border rounded hover:bg-gray-50"
          >
            <Database className="w-4 h-4" />
            <span>Database</span>
          </button>
          <button
            onClick={() => onAddNode('mindMapNode')}
            className="flex items-center gap-2 p-2 text-sm border rounded hover:bg-gray-50"
          >
            <Brain className="w-4 h-4" />
            <span>Mind Map</span>
          </button>
        </div>
      </div>

      {/* Tools */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Tools</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="flex items-center gap-2 p-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            <Undo2 className="w-4 h-4" />
            <span>Undo</span>
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="flex items-center gap-2 p-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            <Redo2 className="w-4 h-4" />
            <span>Redo</span>
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onSave}
            className="flex items-center gap-2 p-2 text-sm border rounded hover:bg-gray-50"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
          <button
            onClick={onExport}
            className="flex items-center gap-2 p-2 text-sm border rounded hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={onShowHistory}
            className="flex items-center gap-2 p-2 text-sm border rounded hover:bg-gray-50"
          >
            <History className="w-4 h-4" />
            <span>History</span>
          </button>
          <button
            onClick={onShowComments}
            className="flex items-center gap-2 p-2 text-sm border rounded hover:bg-gray-50"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Comments</span>
          </button>
          <button
            onClick={onClear}
            className="flex items-center gap-2 p-2 text-sm border rounded hover:bg-red-50 text-red-600"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Templates - Added Section */}
      {onLoadTemplate && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">Templates</h3>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => onLoadTemplate('businessModelCanvas')}
              className="flex items-center gap-2 p-2 text-sm border rounded hover:bg-gray-50 w-full text-left"
            >
              {/* You might want a specific icon here */}
              <LayoutGrid className="w-4 h-4" /> 
              <span>Business Model Canvas</span>
            </button>
            <button
              onClick={() => onLoadTemplate('leanCanvas')}
              className="flex items-center gap-2 p-2 text-sm border rounded hover:bg-gray-50 w-full text-left"
            >
              {/* You might want a specific icon here */}
              <LayoutGrid className="w-4 h-4" /> 
              <span>Lean Canvas</span>
            </button>
          </div>
        </div>
      )}
      {/* End Templates Section */}

      {/* Continue to Assistance - Added Button */}
      {onContinueToAssistance && (
         <div className="mt-auto pt-4 border-t border-gray-200"> {/* Pushes to bottom */}
          <button
            onClick={onContinueToAssistance}
            className="flex items-center justify-center gap-2 p-2 text-sm border rounded hover:bg-blue-50 text-blue-600 w-full bg-blue-100"
          >
            {/* You might want a specific icon like Wand or Sparkles */}
            <Brain className="w-4 h-4" /> 
            <span>Continue to Assistance</span>
          </button>
        </div>
      )}
      {/* End Continue to Assistance Button */}

    </div>
  );
}; 