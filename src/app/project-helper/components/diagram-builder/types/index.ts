import { Node, Edge } from 'reactflow';

export interface DiagramBuilderProps {
  diagramData?: {
    diagramType?: string;
    projectName?: string;
    projectDescription?: string;
    grade?: string;
    projectDomain?: string;
    projectId?: string;
    nodes: Node[];
    edges: Edge[];
  };
  projectData?: {
    projectName?: string;
    projectDescription?: string;
    grade?: string;
    projectDomain?: string;
    id?: string;
    duration?: string;
  } | null;
  onAssistantData: (data: AssistantDataFromPage) => void;
  onSave?: (data: { nodes: Node[]; edges: Edge[] }) => void;
  onExport?: (data: { nodes: Node[]; edges: Edge[] }) => void;
  onClear?: () => void;
  onShowHistory?: () => void;
  onShowComments?: () => void;
  templateType?: 'flowchart' | 'mindmap' | 'businessCanvas' | 'leanCanvas';
}

export interface AssistantDataFromPage {
  topic: string;
  specificGoals: string[];
  timeAvailable: string;
  grade: string;
  projectDomain: string;
  projectId?: string | null;
  nodes?: Node[];
  edges?: Edge[];
  diagramContent?: string; // Add this field
}

export interface AssistantDataInternal {
  topic: string;
  goals: string[];
  timeAvailable: number;
  grade: string;
  projectDomain: string;
  projectId: string;
}

export interface CommentData {
  id: string;
  username: string;
  text: string;
}

export interface DiagramVersion {
  id: string;
  diagramId: string;
  versionNumber: number;
  createdAt: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
}

export interface DiagramTemplate {
  id: string;
  name: string;
  type: string;
  nodes: Node[];
  edges: Edge[];
  description: string;
  tags: string[];
  thumbnail?: string;
}

export interface NodeColorTheme {
  primary: string;
  secondary: string;
  text: string;
  border: string;
}

export interface EdgeStyle {
  stroke: string;
  strokeWidth: number;
  animated?: boolean;
}

export interface CanvasNodeData {
  label: string;
  content: string;
  color?: string;
  comments?: CommentData[];
}

export interface FlowNodeData {
  label: string;
  content: string;
  role: 'input' | 'process' | 'decision' | 'output';
  color?: string;
  comments?: CommentData[];
}

export interface ShapeNodeData {
  label?: string;
  text?: string;
  shape?: 'rectangle' | 'circle' | 'triangle' | 'diamond';
  color?: string;
  borderColor?: string;
  fontSize?: number;
  width?: number;
  height?: number;
  onUpdate?: (nodeId: string, newData: Partial<ShapeNodeData>) => void;
}

export interface TextNodeData {
  label: string;
  text: string;
  fontSize?: number;
  textColor?: string;
  backgroundColor?: string;
  onUpdate?: (nodeId: string, newData: Partial<TextNodeData>) => void;
}

export interface ImageNodeData {
  label: string;
  imageUrl?: string;
  alt?: string;
  caption?: string;
  backgroundColor?: string;
  width?: number;
  height?: number;
  comments?: CommentData[];
  onUpdate?: (nodeId: string, newData: Partial<ImageNodeData>) => void;
}

export interface CodeNodeData {
  label: string;
  code: string;
  language: string;
  theme?: string;
  color?: string;
  onUpdate?: (nodeId: string, newData: Partial<CodeNodeData>) => void;
}

export interface DatabaseField {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
}

export interface DatabaseTable {
  name: string;
  fields: DatabaseField[];
}

export interface DatabaseNodeData {
  label?: string;
  tables?: { name: string; fields: { name: string; type: string; isPrimaryKey: boolean; isForeignKey: boolean }[] }[];
  color?: string;
  onUpdate?: (nodeId: string, newData: Partial<DatabaseNodeData>) => void;
}

export interface MindMapItem {
  id: string;
  text: string;
  children: MindMapItem[];
  isExpanded: boolean;
  color?: string;
}

export interface MindMapNodeData {
  label: string;
  items: MindMapItem[];
  color?: string;
  comments?: CommentData[];
  onUpdate?: (nodeId: string, newData: Partial<MindMapNodeData>) => void;
}