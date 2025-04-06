-- ============================================================
-- Complete SQL Script for Teaching Apps Project - FIXED VERSION
-- ============================================================
-- This script creates all tables required for the Project Helper application
-- with fixes for proper data storage without authentication requirements

-- ============================================================
-- SETUP AND CLEANUP
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables (in reverse order to avoid foreign key constraints)
DROP TABLE IF EXISTS project_resources;
DROP TABLE IF EXISTS project_assistants; 
DROP TABLE IF EXISTS project_diagrams;
DROP TABLE IF EXISTS project_planners;
DROP TABLE IF EXISTS project_ideations;
DROP TABLE IF EXISTS saved_texts;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;

-- ============================================================
-- CORE TABLES
-- ============================================================

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create projects table with expanded fields to match form data
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade TEXT NOT NULL,
  domain TEXT NOT NULL, 
  description TEXT,
  duration TEXT,
  subject TEXT,
  interests TEXT,
  tools_or_skills TEXT,
  skill_level TEXT DEFAULT 'intermediate',
  target_audience TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create saved_texts table for legacy/general content
CREATE TABLE saved_texts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================
-- PROJECT COMPONENTS TABLES
-- ============================================================

-- Create project_ideations table with proper field types
CREATE TABLE project_ideations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT,
  interests TEXT,
  tools TEXT,
  skill_level TEXT,
  project_duration TEXT,
  target_audience TEXT,
  grade TEXT,
  detailed_explanation TEXT,
  project_domain TEXT,
  project_idea TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create project_planners table with proper field types
CREATE TABLE project_planners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  project_name TEXT,
  project_description TEXT,
  duration TEXT,
  grade TEXT,
  project_domain TEXT,
  project_timeline TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create project_diagrams table with proper field types
CREATE TABLE project_diagrams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  diagram_type TEXT,
  nodes JSONB NOT NULL DEFAULT '[]',
  edges JSONB NOT NULL DEFAULT '[]',
  thumbnail TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create project_resources table with proper field types
CREATE TABLE project_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  planner_id UUID REFERENCES project_planners(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  resource_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create project_assistants table with proper field types
CREATE TABLE project_assistants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  topic TEXT,
  specific_goals TEXT,
  time_available TEXT,
  grade TEXT,
  project_domain TEXT,
  resources JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================
-- INDEXES FOR BETTER PERFORMANCE
-- ============================================================

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_saved_texts_project_id ON saved_texts(project_id);
CREATE INDEX idx_project_ideations_project_id ON project_ideations(project_id);
CREATE INDEX idx_project_planners_project_id ON project_planners(project_id);
CREATE INDEX idx_project_diagrams_project_id ON project_diagrams(project_id);
CREATE INDEX idx_project_resources_project_id ON project_resources(project_id);
CREATE INDEX idx_project_resources_planner_id ON project_resources(planner_id);
CREATE INDEX idx_project_assistants_project_id ON project_assistants(project_id);

-- ============================================================
-- ROW LEVEL SECURITY - DEVELOPMENT MODE
-- ============================================================

-- Disable RLS for development
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE saved_texts DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_ideations DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_planners DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_diagrams DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_assistants DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to set default user_id if not provided
CREATE OR REPLACE FUNCTION set_default_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    -- Check if default dev user exists, create if not
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = '00000000-0000-0000-0000-000000000000') THEN
      INSERT INTO users (id, email, full_name)
      VALUES ('00000000-0000-0000-0000-000000000000', 'dev@example.com', 'Development User');
    END IF;
    NEW.user_id = '00000000-0000-0000-0000-000000000000';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create update triggers for all tables with updated_at columns
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

CREATE TRIGGER update_project_ideations_updated_at
BEFORE UPDATE ON project_ideations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_planners_updated_at
BEFORE UPDATE ON project_planners
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_diagrams_updated_at
BEFORE UPDATE ON project_diagrams
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to automatically set user_id on insert
CREATE TRIGGER set_default_user_id_trigger
BEFORE INSERT ON projects
FOR EACH ROW
EXECUTE FUNCTION set_default_user_id();

-- ============================================================
-- SEED DATA - CREATE DEFAULT USER
-- ============================================================

-- Insert default development user
INSERT INTO users (id, email, full_name) 
VALUES ('00000000-0000-0000-0000-000000000000', 'dev@example.com', 'Development User')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- VALIDATE SETUP
-- ============================================================

-- Check if tables were created successfully
DO $$
BEGIN
  RAISE NOTICE 'Database setup complete. Tables created:';
  RAISE NOTICE '- users';
  RAISE NOTICE '- projects';
  RAISE NOTICE '- saved_texts';
  RAISE NOTICE '- project_ideations';
  RAISE NOTICE '- project_planners';
  RAISE NOTICE '- project_diagrams';
  RAISE NOTICE '- project_resources';
  RAISE NOTICE '- project_assistants';
  RAISE NOTICE '';
  RAISE NOTICE 'Default user created with ID: 00000000-0000-0000-0000-000000000000';
END $$; 