export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface Resource {
  title: string;
  description: string;
  url: string;
}

export interface ResourceData {
  projectName?: string;
  projectDescription?: string;
  duration?: string;
  grade: string;
  projectDomain: string;
  projectTimeline?: string;
}

export interface ProjectAssistantData {
  topic: string;
  specificGoals: string;
  timeAvailable: string;
  grade: string;
  projectDomain: string;
  resources: Resource[];
}

export interface ProjectData {
  projectName: string;
  projectDescription: string;
  duration: string;
  grade: string;
  projectDomain: string;
  id?: string;
  detailedExplanation?: string;
}

export interface ProjectPlannerProps {
  projectData: ProjectData | null;
  onResourceGeneration: (data: ResourceData) => void;
}

export interface ResourceSuggestionsProps {
  resourceData?: ResourceData;
  onProjectAssistant: (data: ProjectAssistantData) => void;
}

export interface ProblemSolverProps {
  assistantData?: AssistantData;
}

export interface AssistantData {
  topic: string;
  specificGoals: string;
  timeAvailable: string;
  grade: string;
  projectDomain: string;
  projectId?: string | null;
}

export interface DiagramData {
  id?: string;
  project_id?: string;
  projectId?: string;
  name?: string;
  diagramType?: string;
  diagram_type?: string;
  nodes?: any[];
  edges?: any[];
  createdAt?: string;
  updatedAt?: string;
  projectName?: string;
  projectDescription?: string;
  grade?: string;
  projectDomain?: string;
}

export interface DiagramBuilderProps {
  diagramData?: DiagramData;
  projectData?: ProjectData | null;
  onAssistantData: (data: AssistantData) => void;
}

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  type: 'business-model-canvas' | 'lean-canvas';
  industry?: string;
  stage?: string;
  sections: CanvasSection[];
  example?: boolean;
  preFilledData?: Record<string, string>;
}

export interface CanvasSection {
  id: string;
  label: string;
  position: { x: number, y: number };
  width?: number;
  height?: number;
  description?: string;
  color?: string;
  icon?: string;
}

export interface CommentData {
  id: string;
  nodeId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
  resolved?: boolean;
}

export interface DiagramVersion {
  id: string;
  diagramId: string;
  versionNumber: number;
  nodes: any[];
  edges: any[];
  createdAt: string;
  createdBy: string;
  description?: string;
}
