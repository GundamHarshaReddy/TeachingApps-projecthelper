-- Fix Row Level Security policies for projects table
-- This relaxes the security for development purposes

-- First, temporarily disable RLS on the projects table
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

-- Option 1: Re-enable RLS with a permissive policy for development
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS projects_select_own ON projects;
DROP POLICY IF EXISTS projects_insert_own ON projects;
DROP POLICY IF EXISTS projects_update_own ON projects;
DROP POLICY IF EXISTS projects_delete_own ON projects;

-- Create a permissive policy that allows all operations (for development only)
CREATE POLICY projects_all_operations ON projects
  USING (true)
  WITH CHECK (true);

-- Option 2 (Alternative): If you use Supabase Auth, create proper policies
-- Uncomment and use these instead of the permissive policy for production

/*
-- For authenticated users to insert with their user_id
CREATE POLICY projects_insert_as_user ON projects 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- For authenticated users to view their own projects
CREATE POLICY projects_select_own ON projects 
  FOR SELECT 
  USING (user_id = auth.uid() OR user_id IS NULL);

-- For authenticated users to update their own projects
CREATE POLICY projects_update_own ON projects 
  FOR UPDATE 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- For authenticated users to delete their own projects
CREATE POLICY projects_delete_own ON projects 
  FOR DELETE 
  USING (user_id = auth.uid());
*/

-- Also fix RLS for project_diagrams
DROP POLICY IF EXISTS project_diagrams_select_own ON project_diagrams;
DROP POLICY IF EXISTS project_diagrams_insert_own ON project_diagrams;
DROP POLICY IF EXISTS project_diagrams_update_own ON project_diagrams;
DROP POLICY IF EXISTS project_diagrams_delete_own ON project_diagrams;

-- Make it permissive for development
CREATE POLICY diagrams_all_operations ON project_diagrams
  USING (true)
  WITH CHECK (true); 