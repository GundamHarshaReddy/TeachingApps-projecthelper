import { Node, Edge } from 'reactflow';

// Define standard dimensions (adjust as needed)
const nodeWidth = 200;
const nodeHeight = 120;
const hGap = 30;
const vGap = 30;

// Placeholder Data - Refine positions, content, and styles as needed

export const businessModelCanvasTemplate = {
  nodes: [
    // Row 1
    { id: 'bmc-kp', type: 'canvasNode', position: { x: hGap, y: vGap }, data: { label: 'Key Partners', content: '' }, width: nodeWidth, height: nodeHeight * 2 + vGap }, // Spans two rows height
    { id: 'bmc-ka', type: 'canvasNode', position: { x: hGap * 2 + nodeWidth, y: vGap }, data: { label: 'Key Activities', content: '' }, width: nodeWidth, height: nodeHeight },
    { id: 'bmc-vp', type: 'canvasNode', position: { x: hGap * 3 + nodeWidth * 2, y: vGap }, data: { label: 'Value Propositions', content: '' }, width: nodeWidth, height: nodeHeight * 2 + vGap }, // Spans two rows height
    { id: 'bmc-cr', type: 'canvasNode', position: { x: hGap * 4 + nodeWidth * 3, y: vGap }, data: { label: 'Customer Relationships', content: '' }, width: nodeWidth, height: nodeHeight },
    { id: 'bmc-cs', type: 'canvasNode', position: { x: hGap * 5 + nodeWidth * 4, y: vGap }, data: { label: 'Customer Segments', content: '' }, width: nodeWidth, height: nodeHeight * 2 + vGap }, // Spans two rows height
    
    // Row 2 (under Key Activities and Customer Relationships)
    { id: 'bmc-kr', type: 'canvasNode', position: { x: hGap * 2 + nodeWidth, y: vGap * 2 + nodeHeight }, data: { label: 'Key Resources', content: '' }, width: nodeWidth, height: nodeHeight },
    { id: 'bmc-ch', type: 'canvasNode', position: { x: hGap * 4 + nodeWidth * 3, y: vGap * 2 + nodeHeight }, data: { label: 'Channels', content: '' }, width: nodeWidth, height: nodeHeight },
    
    // Row 3 (Bottom)
    { id: 'bmc-cst', type: 'canvasNode', position: { x: hGap, y: vGap * 3 + nodeHeight * 2 }, data: { label: 'Cost Structure', content: '' }, width: nodeWidth * 2 + hGap, height: nodeHeight }, // Spans two columns width
    { id: 'bmc-rs', type: 'canvasNode', position: { x: hGap * 3 + nodeWidth * 2, y: vGap * 3 + nodeHeight * 2 }, data: { label: 'Revenue Streams', content: '' }, width: nodeWidth * 3 + hGap * 2, height: nodeHeight }, // Spans three columns width

  ] as Node[],
  edges: [] as Edge[], // No default edges for BMC usually
};

export const leanCanvasTemplate = {
  nodes: [
    // Row 1
    { id: 'lc-problem', type: 'canvasNode', position: { x: hGap, y: vGap }, data: { label: 'Problem', content: 'Top 1-3 problems' }, width: nodeWidth, height: nodeHeight * 2 + vGap }, // Span 2 rows
    { id: 'lc-solution', type: 'canvasNode', position: { x: hGap * 2 + nodeWidth, y: vGap }, data: { label: 'Solution', content: 'Top 3 features' }, width: nodeWidth, height: nodeHeight },
    { id: 'lc-uvp', type: 'canvasNode', position: { x: hGap * 3 + nodeWidth * 2, y: vGap }, data: { label: 'Unique Value Proposition', content: 'Single, clear, compelling message...' }, width: nodeWidth, height: nodeHeight * 2 + vGap }, // Span 2 rows
    { id: 'lc-channels', type: 'canvasNode', position: { x: hGap * 4 + nodeWidth * 3, y: vGap }, data: { label: 'Channels', content: 'Path to customers' }, width: nodeWidth, height: nodeHeight },
    { id: 'lc-segments', type: 'canvasNode', position: { x: hGap * 5 + nodeWidth * 4, y: vGap }, data: { label: 'Customer Segments', content: 'Target customers / early adopters' }, width: nodeWidth, height: nodeHeight * 2 + vGap }, // Span 2 rows

    // Row 2
    { id: 'lc-metrics', type: 'canvasNode', position: { x: hGap * 2 + nodeWidth, y: vGap * 2 + nodeHeight }, data: { label: 'Key Metrics', content: 'Key activities you measure' }, width: nodeWidth, height: nodeHeight },
    { id: 'lc-advantage', type: 'canvasNode', position: { x: hGap * 4 + nodeWidth * 3, y: vGap * 2 + nodeHeight }, data: { label: 'Unfair Advantage', content: 'Cannot be easily copied or bought' }, width: nodeWidth, height: nodeHeight },
    
    // Row 3 (Bottom)
    { id: 'lc-cost', type: 'canvasNode', position: { x: hGap, y: vGap * 3 + nodeHeight * 2 }, data: { label: 'Cost Structure', content: 'List operational & setup costs' }, width: nodeWidth * 2 + hGap, height: nodeHeight }, // Span 2 columns
    { id: 'lc-revenue', type: 'canvasNode', position: { x: hGap * 3 + nodeWidth * 2, y: vGap * 3 + nodeHeight * 2 }, data: { label: 'Revenue Streams', content: 'List sources of revenue' }, width: nodeWidth * 3 + hGap * 2, height: nodeHeight }, // Span 3 columns

  ] as Node[],
  edges: [] as Edge[], // No default edges for Lean Canvas usually
}; 