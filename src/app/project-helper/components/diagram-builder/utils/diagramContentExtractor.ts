import { Node, Edge } from 'reactflow';
import { 
  CanvasNodeData,
  FlowNodeData, 
  TextNodeData, 
  CodeNodeData,
  DatabaseNodeData,
  MindMapNodeData,
  ImageNodeData,
  ShapeNodeData,
  MindMapItem
} from '../types';

/**
 * Extracts content from diagram nodes and edges and formats it into a structured form
 * for the assistant to understand
 */
export function extractDiagramContent(nodes: Node[], edges: Edge[]): string {
  if (!nodes || nodes.length === 0) {
    return "No diagram content available.";
  }

  let output = "## Diagram Content\n\n";

  // Group nodes by type for better organization
  const nodesByType: Record<string, Node[]> = {};
  nodes.forEach(node => {
    if (!nodesByType[node.type || 'unknown']) {
      nodesByType[node.type || 'unknown'] = [];
    }
    nodesByType[node.type || 'unknown'].push(node);
  });

  // Process each node type
  Object.entries(nodesByType).forEach(([type, typeNodes]) => {
    output += `### ${formatNodeTypeName(type)} (${typeNodes.length})\n\n`;

    typeNodes.forEach(node => {
      output += extractNodeContent(node, type);
    });

    output += '\n';
  });

  // Process edges to show connections
  if (edges && edges.length > 0) {
    output += "### Connections\n\n";
    
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        const sourceLabel = getNodeLabel(sourceNode);
        const targetLabel = getNodeLabel(targetNode);
        const sourceType = formatNodeTypeName(sourceNode.type || 'unknown');
        const targetType = formatNodeTypeName(targetNode.type || 'unknown');
        
        // Use explicit relationship verbs to help the assistant identify relationships
        // These will be picked up by the relationship detection in the ProblemSolver
        const relationship = chooseRelationshipVerb(sourceNode.type, targetNode.type);
        
        output += `- ${sourceLabel} (${sourceType}) ${relationship} ${targetLabel} (${targetType})`;
        if (edge.label) {
          output += ` for ${edge.label}`;
        }
        output += '.\n';
      }
    });
  }

  return output;
}

// Format node type names for better readability
function formatNodeTypeName(type: string): string {
  if (!type) return 'Unknown';
  
  // Remove "Node" suffix if present
  const base = type.endsWith('Node') ? type.slice(0, -4) : type;
  
  // Capitalize first letter and add spaces between camelCase
  return base.charAt(0).toUpperCase() + 
    base.slice(1).replace(/([A-Z])/g, ' $1');
}

// Extract content based on node type
function extractNodeContent(node: Node, type: string): string {
  let output = '';
  const { id, data, position } = node;

  switch (type) {
    case 'canvasNode':
      const canvasData = data as CanvasNodeData;
      output += `- **${canvasData.label}**: ${canvasData.content || '(No content)'}\n`;
      break;
      
    case 'flowNode':
      const flowData = data as FlowNodeData;
      output += `- **${flowData.label}** (${flowData.role || 'process'}): ${flowData.content || '(No content)'}\n`;
      break;
      
    case 'textNode':
      const textData = data as TextNodeData;
      output += `- **${textData.label}**: ${textData.text || '(No text)'}\n`;
      break;
      
    case 'codeNode':
      const codeData = data as CodeNodeData;
      output += `- **${codeData.label}** (${codeData.language}):\n\`\`\`${codeData.language}\n${codeData.code || '// No code'}\n\`\`\`\n`;
      break;
      
    case 'databaseNode':
      const dbData = data as DatabaseNodeData;
      output += `- **${dbData.label || 'Database'}**:\n`;
      if (dbData.tables && dbData.tables.length > 0) {
        dbData.tables.forEach(table => {
          output += `  - Table: ${table.name}\n`;
          table.fields.forEach(field => {
            const markers = [];
            if (field.isPrimaryKey) markers.push('PK');
            if (field.isForeignKey) markers.push('FK');
            const markerText = markers.length > 0 ? ` [${markers.join(', ')}]` : '';
            output += `    - ${field.name}: ${field.type}${markerText}\n`;
          });
        });
      } else {
        output += `  (No tables defined)\n`;
      }
      break;
      
    case 'mindMapNode':
      const mindMapData = data as MindMapNodeData;
      output += `- **${mindMapData.label}**:\n`;
      if (mindMapData.items && mindMapData.items.length > 0) {
        output += renderMindMapItems(mindMapData.items);
      } else {
        output += `  (No items defined)\n`;
      }
      break;
      
    case 'imageNode':
      const imageData = data as ImageNodeData;
      output += `- **${imageData.label || 'Image'}**: ${imageData.caption || '(No caption)'}\n`;
      break;
      
    case 'shapeNode':
      const shapeData = data as ShapeNodeData;
      output += `- **${shapeData.label || 'Shape'}** (${shapeData.shape || 'rectangle'}): ${shapeData.text || '(No text)'}\n`;
      break;
      
    default:
      output += `- **${getNodeLabel(node)}**: ${JSON.stringify(data).substring(0, 100)}\n`;
      break;
  }
  
  return output;
}

// Recursively render mind map items
function renderMindMapItems(items: MindMapItem[], indent = 2): string {
  let output = '';
  
  items.forEach(item => {
    output += `${' '.repeat(indent)}- ${item.text}\n`;
    if (item.children && item.children.length > 0) {
      output += renderMindMapItems(item.children, indent + 2);
    }
  });
  
  return output;
}

// Get a label for a node (fallback to id if no label found)
function getNodeLabel(node: Node): string {
  if (!node || !node.data) return node?.id || 'Unknown';
  
  if (typeof node.data.label === 'string') {
    return node.data.label;
  }
  
  return node.id;
}

/**
 * Creates a simplified JSON representation of the diagram
 * Alternative to text format if needed
 */
export function createDiagramJsonSummary(nodes: Node[], edges: Edge[]): any {
  const nodeSummaries = nodes.map(node => {
    const baseInfo = {
      id: node.id,
      type: node.type,
      label: getNodeLabel(node),
    };
    
    switch (node.type) {
      case 'canvasNode':
        return {
          ...baseInfo,
          content: (node.data as CanvasNodeData).content
        };
      case 'textNode':
        return {
          ...baseInfo,
          text: (node.data as TextNodeData).text
        };
      case 'flowNode':
        return {
          ...baseInfo,
          role: (node.data as FlowNodeData).role,
          content: (node.data as FlowNodeData).content
        };
      // Add other node types as needed
      default:
        return baseInfo;
    }
  });
  
  const connectionSummaries = edges.map(edge => ({
    from: edge.source,
    to: edge.target,
    label: edge.label
  }));
  
  return {
    nodes: nodeSummaries,
    connections: connectionSummaries
  };
}

/**
 * Helper function to extract specific goals from nodes
 */
export function extractSpecificGoalsFromNodes(nodes: Node[]): string[] {
  const goals: string[] = [];
  
  // Collect text from different node types that might contain goals
  nodes.forEach(node => {
    if (node.type === 'canvasNode' && node.data.label?.toLowerCase().includes('goal')) {
      goals.push(node.data.content || '');
    }
    else if (node.type === 'textNode' && node.data.label?.toLowerCase().includes('goal')) {
      goals.push(node.data.text || '');
    }
    else if (node.type === 'flowNode' && node.data.role === 'output') {
      goals.push(node.data.content || '');
    }
  });
  
  // Filter to ensure non-empty goals
  const filteredGoals = goals.filter(goal => goal.trim().length > 0);
  
  // Use Array.from to convert Set to array (avoids iteration issues)
  return Array.from(new Set(filteredGoals));
}

// Helper function to choose appropriate relationship verbs based on node types
function chooseRelationshipVerb(sourceType?: string, targetType?: string): string {
  // If either type is undefined, default to "connects to"
  if (!sourceType || !targetType) return "connects to";
  
  // Based on the source and target types, choose an appropriate verb
  if (sourceType === "flowNode" && targetType === "flowNode") return "flows to";
  if (sourceType === "codeNode" && targetType === "codeNode") return "references";
  if (sourceType === "databaseNode") return "links to";
  if (targetType === "databaseNode") return "stores data in";
  if (sourceType === "mindMapNode") return "links conceptually to";
  if (sourceType === "shapeNode" && targetType === "textNode") return "is described by";
  
  // Default relationship
  return "connects to";
}
