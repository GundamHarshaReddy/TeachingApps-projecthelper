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
  diagramType: string;
  projectName: string;
  projectDescription: string;
  grade: string;
  projectDomain: string;
  projectId?: string | null;
  nodes: any[];
  edges: any[];
}

export interface DiagramBuilderProps {
  diagramData?: DiagramData;
  projectData?: ProjectData | null;
  onAssistantData: (data: AssistantData) => void;
}
