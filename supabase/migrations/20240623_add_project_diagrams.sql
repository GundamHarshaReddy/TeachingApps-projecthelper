-- Create a table for project diagrams
CREATE TABLE IF NOT EXISTS project_diagrams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  diagram_type TEXT NOT NULL,
  nodes JSONB NOT NULL DEFAULT '[]',
  edges JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add an index for faster lookups by project_id
CREATE INDEX IF NOT EXISTS idx_project_diagrams_project_id ON project_diagrams(project_id);

-- Add a unique constraint to ensure one diagram type per project
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_diagrams_unique ON project_diagrams(project_id, diagram_type);

-- Enable Row Level Security
ALTER TABLE project_diagrams ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to manage their own diagrams
CREATE POLICY manage_own_diagrams ON project_diagrams
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())); 