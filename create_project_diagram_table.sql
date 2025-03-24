-- Create the project_diagrams table (simplified script)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop the project_diagrams table if it exists
DROP TABLE IF EXISTS project_diagrams;

-- Create the project_diagrams table
CREATE TABLE project_diagrams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL,
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

-- Create a policy that allows all operations
CREATE POLICY manage_all_diagrams ON project_diagrams
  USING (true)
  WITH CHECK (true);

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_diagrams_updated_at
BEFORE UPDATE ON project_diagrams
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 