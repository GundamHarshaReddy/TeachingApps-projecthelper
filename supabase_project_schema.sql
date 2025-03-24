-- Project Helper Application: Complete Database Schema
-- This script creates and configures all the tables necessary for the Project Helper application.
-- Execute this in your Supabase SQL Editor.

-- ========================================================
-- STEP 1: ENABLE REQUIRED EXTENSIONS
-- ========================================================

-- Enable UUID extension for generating unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================================
-- STEP 2: DROP EXISTING TABLES (if they exist)
-- ========================================================

-- Drop tables in reverse order of dependency
DROP TABLE IF EXISTS project_diagrams;
DROP TABLE IF EXISTS saved_texts;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;

-- ========================================================
-- STEP 3: CREATE CORE TABLES
-- ========================================================

-- Users table: Stores user information
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- UUID primary key
  email TEXT UNIQUE NOT NULL,                     -- User email (unique)
  full_name TEXT,                                 -- User's full name
  avatar_url TEXT,                                -- URL to user's avatar
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Projects table: Stores project information
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- UUID primary key
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Foreign key to users
  name TEXT NOT NULL,                             -- Project name
  grade TEXT NOT NULL,                            -- Education grade level
  domain TEXT NOT NULL,                           -- Project domain/category
  description TEXT,                               -- Project description
  duration TEXT,                                  -- Project duration
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Saved Texts table: Stores various text content for projects
CREATE TABLE saved_texts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- UUID primary key
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE, -- Foreign key to projects
  type TEXT NOT NULL,                             -- Content type (e.g., ideation, plan, resources)
  content JSONB NOT NULL,                         -- The actual content in JSON format
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Project Diagrams table: Stores diagram data for projects
CREATE TABLE project_diagrams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- UUID primary key
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE, -- Foreign key to projects
  diagram_type TEXT NOT NULL,                     -- Diagram type (e.g., business-model-canvas, lean-canvas)
  nodes JSONB NOT NULL DEFAULT '[]',              -- Diagram nodes in JSON format
  edges JSONB NOT NULL DEFAULT '[]',              -- Diagram edges in JSON format
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ========================================================
-- STEP 4: CREATE INDEXES AND CONSTRAINTS
-- ========================================================

-- Create indexes for foreign keys to improve query performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_saved_texts_project_id ON saved_texts(project_id);
CREATE INDEX idx_project_diagrams_project_id ON project_diagrams(project_id);

-- Add unique constraints
-- One diagram type per project
CREATE UNIQUE INDEX idx_project_diagrams_unique ON project_diagrams(project_id, diagram_type);

-- ========================================================
-- STEP 5: ENABLE ROW LEVEL SECURITY
-- ========================================================

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_diagrams ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
-- Users can only read and modify their own data
CREATE POLICY user_crud_own ON users
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create RLS policies for projects table
-- Users can only select their own projects
CREATE POLICY projects_select_own ON projects
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can only insert projects linked to themselves
CREATE POLICY projects_insert_own ON projects
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can only update their own projects
CREATE POLICY projects_update_own ON projects
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can only delete their own projects
CREATE POLICY projects_delete_own ON projects
  FOR DELETE
  USING (user_id = auth.uid());

-- Create RLS policies for saved_texts table
-- Users can only select saved texts from their own projects
CREATE POLICY saved_texts_select_own ON saved_texts
  FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Users can only insert saved texts for their own projects
CREATE POLICY saved_texts_insert_own ON saved_texts
  FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Users can only update saved texts for their own projects
CREATE POLICY saved_texts_update_own ON saved_texts
  FOR UPDATE
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Users can only delete saved texts for their own projects
CREATE POLICY saved_texts_delete_own ON saved_texts
  FOR DELETE
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Create RLS policies for project_diagrams table
-- Users can only select diagrams from their own projects
CREATE POLICY project_diagrams_select_own ON project_diagrams
  FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Users can only insert diagrams for their own projects
CREATE POLICY project_diagrams_insert_own ON project_diagrams
  FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Users can only update diagrams for their own projects
CREATE POLICY project_diagrams_update_own ON project_diagrams
  FOR UPDATE
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Users can only delete diagrams for their own projects
CREATE POLICY project_diagrams_delete_own ON project_diagrams
  FOR DELETE
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- ========================================================
-- STEP 6: CREATE TRIGGERS AND FUNCTIONS
-- ========================================================

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update the updated_at column
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

-- ========================================================
-- STEP 7: HANDLE USER CREATION (OPTIONAL)
-- ========================================================

-- This function automatically creates a record in the users table
-- when a new user signs up through Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on the auth.users table
-- Uncomment if you're using Supabase Auth
/*
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
*/

-- ========================================================
-- STEP 8: ADD SAMPLE DATA (OPTIONAL)
-- ========================================================

-- Uncomment and modify this section to add sample data
/*
-- Insert sample user
INSERT INTO users (id, email, full_name) 
VALUES ('00000000-0000-0000-0000-000000000000', 'test@example.com', 'Test User');

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

-- Insert sample saved text (project plan)
INSERT INTO saved_texts (project_id, type, content)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'plan',
  '{
    "title": "Project Plan",
    "timeline": [
      {"phase": "Research", "duration": "1 week", "tasks": ["Task 1", "Task 2"]},
      {"phase": "Development", "duration": "2 weeks", "tasks": ["Task 3", "Task 4"]},
      {"phase": "Testing", "duration": "1 week", "tasks": ["Task 5"]}
    ]
  }'::jsonb
);

-- Insert sample business model canvas diagram
INSERT INTO project_diagrams (project_id, diagram_type, nodes, edges) 
VALUES (
  '11111111-1111-1111-1111-111111111111', 
  'business-model-canvas',
  '[
    {"id": "key-partners", "type": "canvasNode", "position": {"x": 0, "y": 0}, "data": {"label": "Key Partners", "content": "Sample partners"}},
    {"id": "key-activities", "type": "canvasNode", "position": {"x": 220, "y": 0}, "data": {"label": "Key Activities", "content": "Sample activities"}},
    {"id": "value-propositions", "type": "canvasNode", "position": {"x": 440, "y": 0}, "data": {"label": "Value Propositions", "content": "Sample value props"}}
  ]'::jsonb,
  '[]'::jsonb
);
*/ 