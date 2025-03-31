import { Node, Edge } from '@xyflow/react';

export interface NodeData extends Record<string, unknown> {
  label: string;
  content: string;
  onChange?: (content: string) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export type CustomNode = Node<NodeData>;

export interface DiagramData {
  projectId?: string;
  diagramType?: string;
  nodes?: CustomNode[];
  edges?: Edge[];
  updated_at?: string;
  template?: string;
  version?: number;
}

export interface ProjectData {
  id?: string;
  projectName?: string;
  grade?: string;
  projectDomain?: string;
}

export interface AssistantData {
  topic: string;
  specificGoals: string;
  timeAvailable: string;
  grade: string;
  projectDomain: string;
  projectId: string;
}

export interface DiagramBuilderProps {
  diagramData?: DiagramData;
  projectData?: ProjectData;
  onAssistantData: (data: AssistantData) => void;
}

export interface CommentData {
  id: string;
  nodeId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: 'editor' | 'viewer';
  joinedAt: string;
  online: boolean;
  lastActive: string;
}

export interface TemplateSection {
  id: string;
  label: string;
  description: string;
  color: string;
  icon: string;
  width: number;
  height: number;
  position: { x: number; y: number };
}

export interface Template {
  id: string;
  name: string;
  description: string;
  sections: TemplateSection[];
  thumbnail: string;
  category: 'business-model-canvas' | 'lean-canvas' | 'ai-startup-canvas';
  type?: string;
  preFilledData?: Record<string, unknown>;
}