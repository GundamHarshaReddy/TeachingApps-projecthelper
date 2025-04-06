import { Node, Edge } from 'reactflow';

// Interface for templates
export interface DiagramTemplate {
  nodes: Node[];
  edges: Edge[];
}

// SWOT Analysis Template
export const swotTemplate: DiagramTemplate = {
  nodes: [
    {
      id: 'strengths',
      type: 'canvasNode',
      position: { x: 50, y: 50 },
      data: { label: 'Strengths', content: 'What do you do well?' },
      style: { background: '#e6ffee', width: 250, height: 200 }
    },
    {
      id: 'weaknesses',
      type: 'canvasNode',
      position: { x: 350, y: 50 },
      data: { label: 'Weaknesses', content: 'What could you improve?' },
      style: { background: '#ffe6e6', width: 250, height: 200 }
    },
    {
      id: 'opportunities',
      type: 'canvasNode',
      position: { x: 50, y: 300 },
      data: { label: 'Opportunities', content: 'What opportunities are open to you?' },
      style: { background: '#e6f7ff', width: 250, height: 200 }
    },
    {
      id: 'threats',
      type: 'canvasNode',
      position: { x: 350, y: 300 },
      data: { label: 'Threats', content: 'What threats could harm you?' },
      style: { background: '#fff5e6', width: 250, height: 200 }
    }
  ],
  edges: []
};

// AI Model Canvas template
export const aiModelCanvasTemplate: DiagramTemplate = {
  nodes: [
    {
      id: 'problem',
      type: 'canvasNode',
      position: { x: 50, y: 50 },
      data: { label: 'Problem', content: 'What problem does your AI solve?' },
      style: { width: 200, height: 150 }
    },
    {
      id: 'data',
      type: 'canvasNode',
      position: { x: 300, y: 50 },
      data: { label: 'Data Sources', content: 'What data will you use?' },
      style: { width: 200, height: 150 }
    },
    {
      id: 'algorithms',
      type: 'canvasNode',
      position: { x: 550, y: 50 },
      data: { label: 'Algorithms', content: 'What AI techniques will you use?' },
      style: { width: 200, height: 150 }
    },
    {
      id: 'metrics',
      type: 'canvasNode',
      position: { x: 50, y: 250 },
      data: { label: 'Metrics', content: 'How will you measure success?' },
      style: { width: 200, height: 150 }
    },
    {
      id: 'implementation',
      type: 'canvasNode',
      position: { x: 300, y: 250 },
      data: { label: 'Implementation', content: 'How will you implement the model?' },
      style: { width: 200, height: 150 }
    },
    {
      id: 'ethics',
      type: 'canvasNode',
      position: { x: 550, y: 250 },
      data: { label: 'Ethics & Risks', content: 'What ethical considerations exist?' },
      style: { width: 200, height: 150 }
    }
  ],
  edges: []
}; 