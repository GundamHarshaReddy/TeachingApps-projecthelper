-- Complete SQL script for Project Helper application
-- This script will drop existing tables and recreate them

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables (in reverse order to avoid foreign key constraints)
DROP TABLE IF EXISTS project_diagrams;
DROP TABLE IF EXISTS saved_texts;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade TEXT NOT NULL,
  domain TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create saved_texts table for storing various text content
CREATE TABLE saved_texts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- ideation, plan, resources, etc.
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create project_diagrams table for storing diagram data
CREATE TABLE project_diagrams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  diagram_type TEXT NOT NULL,
  nodes JSONB NOT NULL DEFAULT '[]',
  edges JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance optimization
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_saved_texts_project_id ON saved_texts(project_id);
CREATE INDEX idx_project_diagrams_project_id ON project_diagrams(project_id);

-- Unique constraints
CREATE UNIQUE INDEX idx_project_diagrams_unique ON project_diagrams(project_id, diagram_type);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_diagrams ENABLE ROW LEVEL SECURITY;

-- RLS policies for users
CREATE POLICY user_crud_own ON users
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS policies for projects
CREATE POLICY projects_select_own ON projects
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY projects_insert_own ON projects
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY projects_update_own ON projects
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY projects_delete_own ON projects
  FOR DELETE
  USING (user_id = auth.uid());

-- RLS policies for saved_texts
CREATE POLICY saved_texts_select_own ON saved_texts
  FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY saved_texts_insert_own ON saved_texts
  FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY saved_texts_update_own ON saved_texts
  FOR UPDATE
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY saved_texts_delete_own ON saved_texts
  FOR DELETE
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- RLS policies for project_diagrams
CREATE POLICY project_diagrams_select_own ON project_diagrams
  FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY project_diagrams_insert_own ON project_diagrams
  FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY project_diagrams_update_own ON project_diagrams
  FOR UPDATE
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY project_diagrams_delete_own ON project_diagrams
  FOR DELETE
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Create or replace functions for timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_texts_updated_at
BEFORE UPDATE ON saved_texts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_diagrams_updated_at
BEFORE UPDATE ON project_diagrams
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (uncomment to use)
/*
-- Insert sample user
INSERT INTO users (id, email) 
VALUES ('00000000-0000-0000-0000-000000000000', 'test@example.com');

-- Insert sample project
INSERT INTO projects (id, user_id, name, grade, domain, description) 
VALUES (
  '11111111-1111-1111-1111-111111111111', 
  '00000000-0000-0000-0000-000000000000', 
  'Sample Project', 
  'Grade 10', 
  'technical', 
  'This is a sample project for testing'
);

-- Insert sample diagram
INSERT INTO project_diagrams (project_id, diagram_type, nodes, edges) 
VALUES (
  '11111111-1111-1111-1111-111111111111', 
  'business-model-canvas',
  '[
    {"id": "key-partners", "type": "canvasNode", "position": {"x": 0, "y": 0}, "data": {"label": "Key Partners", "content": "Sample partners"}}
  ]'::jsonb,
  '[]'::jsonb
);
*/ 