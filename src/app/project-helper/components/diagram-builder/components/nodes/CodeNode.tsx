import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Code } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CodeNodeData } from '../../types';

interface CodeNodeProps extends NodeProps {
  data: CodeNodeData;
}

export const CodeNode: React.FC<CodeNodeProps> = ({
  id,
  data,
  selected
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [code, setCode] = useState(data.code || '// Enter your code here');
  const [label, setLabel] = useState(data.label || 'Code');
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [language, setLanguage] = useState(data.language || 'javascript');

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
    data.onUpdate?.(id, { language: e.target.value });
  };

  const handleSave = () => {
    setIsEditing(false);
    data.onUpdate?.(id, { code });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  return (
    <div 
      className="relative code-node group"
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
        style={{ 
          backgroundColor: data.color || '#1e1e1e',
          borderRadius: '4px',
          padding: '8px',
          minWidth: '200px',
          minHeight: '100px'
        }}
      >
        <Handle type="source" position={Position.Top} id="source-top" data-handleid="source-top" data-nodeid={id} data-handlepos={Position.Top} style={{ background: '#555', top: -4, zIndex: 20 }} isConnectable={true} />
        <Handle type="source" position={Position.Bottom} id="source-bottom" data-handleid="source-bottom" data-nodeid={id} data-handlepos={Position.Bottom} style={{ background: '#555', bottom: -4, zIndex: 20 }} isConnectable={true} />
        <Handle type="source" position={Position.Left} id="source-left" data-handleid="source-left" data-nodeid={id} data-handlepos={Position.Left} style={{ background: '#555', left: -4, zIndex: 20 }} isConnectable={true} />
        <Handle type="source" position={Position.Right} id="source-right" data-handleid="source-right" data-nodeid={id} data-handlepos={Position.Right} style={{ background: '#555', right: -4, zIndex: 20 }} isConnectable={true} />
        <Handle type="target" position={Position.Top} id="target-top" data-handleid="target-top" data-nodeid={id} data-handlepos={Position.Top} style={{ background: '#555', top: -4, opacity: 0.6, zIndex: 20 }} isConnectable={true} />
        <Handle type="target" position={Position.Bottom} id="target-bottom" data-handleid="target-bottom" data-nodeid={id} data-handlepos={Position.Bottom} style={{ background: '#555', bottom: -4, opacity: 0.6, zIndex: 20 }} isConnectable={true} />
        <Handle type="target" position={Position.Left} id="target-left" data-handleid="target-left" data-nodeid={id} data-handlepos={Position.Left} style={{ background: '#555', left: -4, opacity: 0.6, zIndex: 20 }} isConnectable={true} />
        <Handle type="target" position={Position.Right} id="target-right" data-handleid="target-right" data-nodeid={id} data-handlepos={Position.Right} style={{ background: '#555', right: -4, opacity: 0.6, zIndex: 20 }} isConnectable={true} />

        <div className="flex items-center gap-2 mb-2">
          <Code className="w-4 h-4 text-gray-400" />
          <select
            value={language}
            onChange={handleLanguageChange}
            className="text-xs bg-gray-800 text-gray-300 border border-gray-700 rounded px-1 nodrag"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
          </select>
        </div>

        {isEditing ? (
          <textarea
            value={code}
            onChange={handleCodeChange}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            autoFocus
            onClick={(e) => e.stopPropagation()}
            className="w-full h-full bg-transparent text-gray-300 font-mono text-sm focus:outline-none resize-none nodrag"
            style={{ minHeight: '100px' }}
          />
        ) : (
          <div 
            onClick={(e) => { 
              e.stopPropagation();
              setIsEditing(true); 
            }}
            className="cursor-text nodrag"
          >
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: '8px',
                background: 'transparent',
                fontSize: '14px',
                fontFamily: 'monospace'
              }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        )}
      </div>
    </div>
  );
}; 