-- This script creates the necessary tables and inserts a placeholder user

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS projects (
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

-- Create project_diagrams table if it doesn't exist
CREATE TABLE IF NOT EXISTS project_diagrams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  diagram_type TEXT NOT NULL,
  nodes JSONB NOT NULL DEFAULT '[]',
  edges JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_diagrams ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for development
DROP POLICY IF EXISTS users_all_operations ON users;
DROP POLICY IF EXISTS projects_all_operations ON projects;
DROP POLICY IF EXISTS diagrams_all_operations ON project_diagrams;

CREATE POLICY users_all_operations ON users USING (true) WITH CHECK (true);
CREATE POLICY projects_all_operations ON projects USING (true) WITH CHECK (true);
CREATE POLICY diagrams_all_operations ON project_diagrams USING (true) WITH CHECK (true);

-- Insert placeholder user if it doesn't exist
INSERT INTO users (id, email, full_name)
VALUES ('00000000-0000-0000-0000-000000000000', 'placeholder@example.com', 'Development User')
ON CONFLICT (id) DO NOTHING;

-- Create unique index for project_diagrams
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_diagrams_unique ON project_diagrams(project_id, diagram_type); 