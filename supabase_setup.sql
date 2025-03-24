-- Create the projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  grade VARCHAR(50) NOT NULL,
  domain VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies to secure the table
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now
-- In a production environment, you'd want to restrict this to the authenticated user
CREATE POLICY "Allow full access to all users" ON public.projects
  USING (true)
  WITH CHECK (true);

-- Add an index for faster queries
CREATE INDEX idx_projects_created_at ON public.projects(created_at);

-- Trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_timestamp
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION update_modified_column(); 