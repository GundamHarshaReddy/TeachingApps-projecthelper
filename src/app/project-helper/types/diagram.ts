import { Collaborator } from './index';

export interface DiagramVersion {
  id: string;
  version: number;
  name: string;
  createdAt: string;
  createdBy: string;
  thumbnail?: string;
  isActive: boolean;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  sections: any[];
  thumbnail: string;
  category: 'business-model-canvas' | 'lean-canvas' | 'ai-startup-canvas';
  type?: string;
  preFilledData?: Record<string, unknown>;
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
      borderColor?: string[];
      borderWidth?: number;
    }[];
  };
  options?: Record<string, any>;
}

export interface ActivityData {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  entityId?: string;
  entityType?: 'node' | 'edge' | 'diagram' | 'comment';
} 