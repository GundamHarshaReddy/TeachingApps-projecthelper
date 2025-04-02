import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Database, Table, Key, Link } from 'lucide-react';
import { DatabaseNodeData } from '../../types';

interface DatabaseField {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
}

interface DatabaseTable {
  name: string;
  fields: DatabaseField[];
}

interface DatabaseNodeProps extends NodeProps {
  data: DatabaseNodeData;
}

export const DatabaseNode: React.FC<DatabaseNodeProps> = ({
  id,
  data,
  selected
}) => {
  const [tables, setTables] = useState<DatabaseTable[]>(data.tables || []);
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [nodeColor, setNodeColor] = useState(data.color || '#f8fafc');

  // Update local state when data changes
  useEffect(() => {
    setTables(data.tables || []);
    setNodeColor(data.color || '#f8fafc');
  }, [data.tables, data.color]);

  const handleAddTable = () => {
    const newTables = [...tables, { name: 'New Table', fields: [] }];
    setTables(newTables);
    data.onUpdate?.(id, { tables: newTables });
  };

  const handleAddField = (tableIndex: number) => {
    const newTables = [...tables];
    newTables[tableIndex].fields.push({
      name: 'New Field',
      type: 'VARCHAR(255)',
      isPrimaryKey: false,
      isForeignKey: false
    });
    setTables(newTables);
    data.onUpdate?.(id, { tables: newTables });
  };

  const handleFieldChange = (tableIndex: number, fieldIndex: number, field: Partial<DatabaseField>) => {
    const newTables = [...tables];
    newTables[tableIndex].fields[fieldIndex] = {
      ...newTables[tableIndex].fields[fieldIndex],
      ...field
    };
    setTables(newTables);
    data.onUpdate?.(id, { tables: newTables });
  };

  const handleTableNameChange = (tableIndex: number, name: string) => {
    const newTables = [...tables];
    newTables[tableIndex].name = name;
    setTables(newTables);
    data.onUpdate?.(id, { tables: newTables });
  };

  return (
    <div
      className={`p-4 rounded-lg border relative ${
        selected ? 'border-blue-500 shadow-lg' : 
        isHovered ? 'border-blue-300 shadow-md' : 
        'border-gray-300'
      } transition-all duration-200`}
      style={{ 
        width: 400, 
        minHeight: 300, 
        backgroundColor: nodeColor,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Bidirectional handles - can be used as both source and target */}
      <Handle type="source" position={Position.Top} id="handle-top" style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.8 }} isConnectable={true} />
      <Handle type="source" position={Position.Bottom} id="handle-bottom" style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.8 }} isConnectable={true} />
      <Handle type="source" position={Position.Left} id="handle-left" style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.8 }} isConnectable={true} />
      <Handle type="source" position={Position.Right} id="handle-right" style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.8 }} isConnectable={true} />
      
      {/* Same handles but as targets with lower opacity */}
      <Handle type="target" position={Position.Top} id="handle-top" style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.3 }} isConnectable={true} />
      <Handle type="target" position={Position.Bottom} id="handle-bottom" style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.3 }} isConnectable={true} />
      <Handle type="target" position={Position.Left} id="handle-left" style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.3 }} isConnectable={true} />
      <Handle type="target" position={Position.Right} id="handle-right" style={{ background: '#6366f1', width: 10, height: 10, opacity: 0.3 }} isConnectable={true} />

      {/* Database header */}
      <div className="flex items-center gap-2 mb-4">
        <Database className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-800">Database Schema</h3>
      </div>

      {/* Tables */}
      <div className="space-y-4">
        {tables.map((table, tableIndex) => (
          <div key={tableIndex} className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Table className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={table.name}
                onChange={(e) => handleTableNameChange(tableIndex, e.target.value)}
                className="font-medium text-gray-800 bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none"
                placeholder="Table Name"
              />
            </div>
            
            {/* Fields */}
            <div className="space-y-2">
              {table.fields.map((field, fieldIndex) => (
                <div key={fieldIndex} className="flex items-center gap-2 text-sm">
                  {field.isPrimaryKey && <Key className="w-3 h-3 text-yellow-500" />}
                  {field.isForeignKey && <Link className="w-3 h-3 text-blue-500" />}
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => handleFieldChange(tableIndex, fieldIndex, { name: e.target.value })}
                    className="flex-1 bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none"
                    placeholder="Field Name"
                  />
                  <select
                    value={field.type}
                    onChange={(e) => handleFieldChange(tableIndex, fieldIndex, { type: e.target.value })}
                    className="bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none"
                  >
                    <option value="VARCHAR(255)">VARCHAR(255)</option>
                    <option value="INT">INT</option>
                    <option value="BOOLEAN">BOOLEAN</option>
                    <option value="DATE">DATE</option>
                    <option value="TEXT">TEXT</option>
                  </select>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={field.isPrimaryKey}
                        onChange={(e) => handleFieldChange(tableIndex, fieldIndex, { isPrimaryKey: e.target.checked })}
                        className="w-3 h-3"
                      />
                      <span className="text-xs text-gray-500">PK</span>
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={field.isForeignKey}
                        onChange={(e) => handleFieldChange(tableIndex, fieldIndex, { isForeignKey: e.target.checked })}
                        className="w-3 h-3"
                      />
                      <span className="text-xs text-gray-500">FK</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            {/* Add field button */}
            <button
              onClick={() => handleAddField(tableIndex)}
              className="mt-2 text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
            >
              + Add Field
            </button>
          </div>
        ))}

        {/* Add table button */}
        <button
          onClick={handleAddTable}
          className="w-full py-2 text-sm text-blue-500 hover:text-blue-600 border border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
        >
          + Add Table
        </button>
      </div>
    </div>
  );
};