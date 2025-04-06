import React, { useState } from 'react';
import { 
  Circle, 
  Square, 
  Brain, 
  Code, 
  Database, 
  Image as ImageIcon, 
  LayoutGrid, 
  Type, 
  Workflow, 
  Undo2, 
  Redo2, 
  Triangle,
  Diamond,
  Bot,
  Hexagon,
  FileCode,
  FileText,
  GitBranch,
  CircleDashed,
  Octagon,
  Star,
  Info,
  Undo,
  Redo,
  Save,
  Download,
  Trash2,
  Clock,
  LucideIcon,
  Settings,
  Keyboard
} from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface SidebarProps {
  onAddNode: (type: string, position?: { x: number; y: number }) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onExport?: (options?: any) => void;
  onClear?: () => void;
  onShowHistory?: () => void;
  onShowComments?: () => void;
  onContinueToAssistance?: () => void;
  onToggleSettings?: () => void;
  onToggleShortcuts?: () => void;
  onLoadTemplate?: (template: string) => void;
}

interface NodeOption {
  id: string;
  type: string;
  icon: LucideIcon;
  label: string;
  description?: string;
  category: 'basic' | 'shape' | 'content' | 'advanced';
}

// Styled Action Button Component
const ActionButton: React.FC<{
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}> = ({ icon: Icon, label, onClick, className, disabled = false }) => {
  return (
    <button
      className={cn(
        "flex flex-col items-center justify-center p-2 w-16 h-16 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors",
        disabled && "opacity-40 cursor-not-allowed",
        className
      )}
      onClick={onClick}
      disabled={disabled}
      title={label}
    >
      <Icon className="h-5 w-5 mb-1" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};

// Node Type Button Component with visual preview
const NodeTypeButton: React.FC<{
  option: NodeOption;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, nodeType: string) => void;
  onClick: () => void;
}> = ({ option, onDragStart, onClick }) => {
  const Icon = option.icon;
  
  // Style mapping for different shape types to make them more visually distinct
  const shapeStyles: Record<string, string> = {
    'circle': 'rounded-full bg-blue-100 text-blue-600',
    'square': 'rounded-md bg-green-100 text-green-600',
    'diamond': 'transform rotate-45 bg-purple-100 text-purple-600',
    'triangle': 'bg-yellow-100 text-yellow-600',
    'hexagon': 'bg-indigo-100 text-indigo-600',
    'octagon': 'bg-rose-100 text-rose-600',
    'star': 'bg-amber-100 text-amber-600',
    'textNode': 'bg-gray-100 text-gray-700 font-medium',
    'codeNode': 'bg-slate-100 text-slate-700 font-mono',
    'imageNode': 'bg-emerald-100 text-emerald-600',
    'databaseNode': 'bg-cyan-100 text-cyan-600',
    'mindMapNode': 'bg-violet-100 text-violet-600',
    'canvasNode': 'bg-teal-100 text-teal-600',
    'flowNode': 'bg-blue-50 text-blue-700',
  };
  
  const nodeType = option.type;
  const baseStyle = nodeType === 'shapeNode' ? shapeStyles[option.id] || '' : shapeStyles[nodeType] || '';
  
  return (
    <div
      className="flex flex-col items-center justify-center gap-1 p-2 cursor-grab hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-all"
      draggable
      onDragStart={(e) => onDragStart(e, option.type === 'shapeNode' ? `${option.type}:${option.id}` : option.type)}
      onClick={onClick}
      title={option.description || option.label}
    >
      <div className={cn(
        "w-14 h-12 flex items-center justify-center text-sm transition-colors rounded-md",
        baseStyle
      )}>
        <Icon className="h-6 w-6" />
      </div>
      <span className="text-xs font-medium text-gray-700">{option.label}</span>
    </div>
  );
};

// Template button component
const TemplateButton: React.FC<{
  name: string;
  description: string;
  onClick: () => void;
}> = ({ name, description, onClick }) => {
  return (
    <button
      className="flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all w-full text-left"
      onClick={onClick}
      title={description}
    >
      <div className="font-medium text-sm">{name}</div>
      <div className="text-xs text-gray-500 truncate w-full">{description}</div>
    </button>
  );
};

const ShapeButton = ({ shape, onDragStart }: { shape: string; onDragStart: (event: React.DragEvent<HTMLDivElement>, nodeType: string) => void }) => {
  let icon;
  let label;
  
  switch (shape) {
    case 'rectangle':
      icon = <div className="w-10 h-6 bg-blue-100 border border-blue-400 rounded-sm" />;
      label = 'Rectangle';
      break;
    case 'diamond':
      icon = <div className="w-8 h-8 bg-green-100 border border-green-400 transform rotate-45" />;
      label = 'Diamond';
      break;
    case 'circle':
      icon = <div className="w-8 h-8 bg-purple-100 border border-purple-400 rounded-full" />;
      label = 'Circle';
      break;
    case 'cylinder':
      icon = (
        <div className="flex flex-col items-center">
          <div className="w-8 h-2 bg-yellow-100 border border-yellow-400 rounded-full" />
          <div className="w-8 h-6 bg-yellow-100 border-l border-r border-yellow-400" />
          <div className="w-8 h-2 bg-yellow-100 border border-yellow-400 rounded-full" />
        </div>
      );
      label = 'Cylinder';
      break;
    case 'process':
      icon = <div className="w-10 h-6 bg-red-100 border border-red-400 rounded" />;
      label = 'Process';
      break;
    case 'triangle':
      icon = (
        <div className="w-10 h-8 relative">
          <div className="absolute top-0 left-0 right-0 bottom-0 border border-teal-400 bg-teal-100" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
        </div>
      );
      label = 'Triangle';
      break;
    default:
      icon = <div className="w-10 h-6 bg-gray-100 border border-gray-400" />;
      label = shape;
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    console.log(`[ShapeButton] Starting drag for shape-${shape}`);
    onDragStart(e, `shape-${shape}`);
    
    // Add additional debugging information
    setTimeout(() => {
      const data = e.dataTransfer.getData('application/reactflow');
      console.log(`[ShapeButton] Data set for transfer:`, data);
    }, 10);
  };

  return (
    <div
      className="flex flex-col items-center p-2 border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors duration-150 cursor-move m-1"
      draggable
      onDragStart={handleDragStart}
      title={`Drag to add ${label}`}
    >
      <div className="flex justify-center items-center w-12 h-12">{icon}</div>
      <span className="text-xs mt-1 text-center">{label}</span>
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  onAddNode,
  onUndo,
  onRedo,
  onSave,
  onExport,
  onClear,
  onShowHistory,
  onShowComments,
  onContinueToAssistance,
  onToggleSettings,
  onToggleShortcuts,
  onLoadTemplate,
}) => {
  // Handle drag start for node types
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Define all node options with better descriptions and categories
  const nodeOptions: NodeOption[] = [
    // Basic nodes
    {
      id: 'flowNode',
      type: 'flowNode',
      icon: Workflow,
      label: 'Flow Node',
      description: 'General purpose node for flowcharts',
      category: 'basic'
    },
    {
      id: 'canvasNode',
      type: 'canvasNode',
      icon: CircleDashed,
      label: 'Canvas',
      description: 'Resizable container node',
      category: 'advanced'
    },
    {
      id: 'mindMapNode',
      type: 'mindMapNode',
      icon: GitBranch,
      label: 'Mind Map',
      description: 'Node for mind mapping',
      category: 'advanced'
    },
    
    // Shape nodes
    {
      id: 'circle',
      type: 'shapeNode',
      icon: Circle,
      label: 'Circle',
      description: 'Circular shape node',
      category: 'shape'
    },
    {
      id: 'square',
      type: 'shapeNode',
      icon: Square,
      label: 'Square',
      description: 'Square shape node',
      category: 'shape'
    },
    {
      id: 'diamond',
      type: 'shapeNode',
      icon: Diamond,
      label: 'Diamond',
      description: 'Diamond shape node',
      category: 'shape'
    },
    {
      id: 'triangle',
      type: 'shapeNode',
      icon: Triangle,
      label: 'Triangle',
      description: 'Triangle shape node',
      category: 'shape'
    },
    {
      id: 'hexagon',
      type: 'shapeNode',
      icon: Hexagon,
      label: 'Hexagon',
      description: 'Hexagon shape node',
      category: 'shape'
    },
    {
      id: 'octagon',
      type: 'shapeNode',
      icon: Octagon,
      label: 'Octagon',
      description: 'Octagon shape node',
      category: 'shape'
    },
    {
      id: 'star',
      type: 'shapeNode',
      icon: Star,
      label: 'Star',
      description: 'Star shape node',
      category: 'shape'
    },
    
    // Content nodes
    {
      id: 'textNode',
      type: 'textNode',
      icon: Type,
      label: 'Text',
      description: 'Text node for adding notes',
      category: 'content'
    },
    {
      id: 'codeNode',
      type: 'codeNode',
      icon: FileCode,
      label: 'Code',
      description: 'Node for code snippets',
      category: 'content'
    },
    {
      id: 'databaseNode',
      type: 'databaseNode',
      icon: Database,
      label: 'Database',
      description: 'Database representation',
      category: 'content'
    },
    {
      id: 'imageNode',
      type: 'imageNode',
      icon: ImageIcon,
      label: 'Image',
      description: 'Node for displaying images',
      category: 'content'
    },
  ];

  // Function to group options by category
  const groupedOptions = {
    basic: nodeOptions.filter(option => option.category === 'basic'),
    shape: nodeOptions.filter(option => option.category === 'shape'),
    content: nodeOptions.filter(option => option.category === 'content'),
    advanced: nodeOptions.filter(option => option.category === 'advanced'),
  };

  return (
    <aside 
      className="w-64 h-full border-r border-gray-200 bg-white p-4 flex flex-col gap-4 overflow-y-auto shadow-md"
    >
      {/* Top Action Buttons (Save, Export, Clear, Settings) */}
      <div className="flex flex-wrap gap-2 justify-center pb-3 border-b border-gray-200">
        {onSave && <ActionButton icon={Save} label="Save" onClick={onSave} />}
        {onExport && <ActionButton icon={Download} label="Export" onClick={() => onExport('options')} />}
        {onClear && <ActionButton icon={Trash2} label="Clear" onClick={onClear} />}
        {onShowHistory && <ActionButton icon={Clock} label="History" onClick={onShowHistory} />}
        {/* {onShowComments && <ActionButton icon={MessagesSquare} label="Comments" onClick={onShowComments} />} // Add comments later if needed */}
        {onToggleSettings && <ActionButton icon={Settings} label="Settings" onClick={onToggleSettings} />}
        {/* Add keyboard shortcuts button */}
        <ActionButton
          icon={Keyboard}
          label="Shortcuts"
          onClick={onToggleShortcuts || (() => {})}
        />
      </div>

      {/* Undo/Redo Buttons */}
      <div className="flex flex-wrap gap-2 justify-center pb-3 border-b border-gray-200">
        {onUndo && <ActionButton icon={Undo} label="Undo" onClick={onUndo} />}
        {onRedo && <ActionButton icon={Redo} label="Redo" onClick={onRedo} />}
      </div>

      <div className="h-px bg-gray-200 my-1"></div>

      {/* Basic Elements Section */}
      <div className="mb-2">
        <h3 className="text-sm font-medium text-gray-500 mb-2 px-2">Basic Elements</h3>
        <div className="grid grid-cols-2 gap-1">
          {groupedOptions.basic.map((option) => (
            <NodeTypeButton
              key={option.id}
              option={option}
              onDragStart={onDragStart}
              onClick={() => onAddNode(option.type, { x: window.innerWidth / 2 - 75, y: window.innerHeight / 2 - 75 })}
            />
          ))}
        </div>
      </div>

      {/* Shapes Section */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2 px-2">
          <h3 className="text-sm font-semibold">Shapes</h3>
          <div className="text-xs text-gray-500">Drag to canvas</div>
        </div>
        <div className="grid grid-cols-2 gap-1">
          <ShapeButton shape="rectangle" onDragStart={onDragStart} />
          <ShapeButton shape="diamond" onDragStart={onDragStart} />
          <ShapeButton shape="circle" onDragStart={onDragStart} />
          <ShapeButton shape="cylinder" onDragStart={onDragStart} />
          <ShapeButton shape="process" onDragStart={onDragStart} />
          <ShapeButton shape="triangle" onDragStart={onDragStart} />
        </div>
      </div>

      {/* Content Elements Section */}
      <div className="mb-2">
        <h3 className="text-sm font-medium text-gray-500 mb-2 px-2">Content</h3>
        <div className="grid grid-cols-2 gap-1">
          {groupedOptions.content.map((option) => (
            <NodeTypeButton
              key={option.id}
              option={option}
              onDragStart={onDragStart}
              onClick={() => onAddNode(option.type, { x: window.innerWidth / 2 - 75, y: window.innerHeight / 2 - 75 })}
            />
          ))}
        </div>
      </div>

      {/* Advanced Elements Section */}
      <div className="mb-2">
        <h3 className="text-sm font-medium text-gray-500 mb-2 px-2">Advanced</h3>
        <div className="grid grid-cols-2 gap-1">
          {groupedOptions.advanced.map((option) => (
            <NodeTypeButton
              key={option.id}
              option={option}
              onDragStart={onDragStart}
              onClick={() => onAddNode(option.type, { x: window.innerWidth / 2 - 75, y: window.innerHeight / 2 - 75 })}
            />
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-200 my-1"></div>

      {/* Project Templates Section */}
      {onLoadTemplate && (
        <div className="mb-2">
          <h3 className="text-sm font-medium text-gray-500 mb-2 px-2">Project Templates</h3>
          <div className="flex flex-col gap-2 px-1">
            <TemplateButton 
              name="Business Model Canvas" 
              description="Visualize your business model components"
              onClick={() => onLoadTemplate('businessModelCanvas')}
            />
            <TemplateButton 
              name="Lean Canvas" 
              description="Problem/solution focused business planning"
              onClick={() => onLoadTemplate('leanCanvas')}
            />
            <TemplateButton 
              name="SWOT Analysis" 
              description="Strengths, Weaknesses, Opportunities, Threats"
              onClick={() => onLoadTemplate('swot')}
            />
            <TemplateButton 
              name="AI Model Canvas" 
              description="Framework for AI project planning"
              onClick={() => onLoadTemplate('aiModelCanvas')}
            />
          </div>
        </div>
      )}

      <div className="h-px bg-gray-200 my-1"></div>

      {/* Chat with Assistant button */}
      {onContinueToAssistance && (
        <button
          onClick={onContinueToAssistance}
          className="mt-auto mb-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center gap-2"
        >
          <Bot size={16} />
          <span className="font-medium text-sm">Chat with Assistant</span>
        </button>
      )}

      {/* Help Section */}
      <div className="p-3 bg-gray-50 rounded-md text-xs text-gray-600 border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Info className="h-4 w-4 text-blue-500" />
          <h3 className="font-medium">Tips</h3>
        </div>
        <ul className="space-y-1 list-disc pl-4">
          <li>Drag elements onto the canvas</li>
          <li>Connect nodes by dragging between handles</li>
          <li>Double-click to edit content</li>
          <li>Use keyboard shortcuts: Ctrl+Z (Undo), Ctrl+Y (Redo)</li>
        </ul>
      </div>
    </aside>
  );
};