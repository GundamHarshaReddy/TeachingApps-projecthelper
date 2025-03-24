# Project Creation Flow Setup

This document provides instructions for setting up the project creation flow in the Teaching Apps platform.

## Overview

The project creation flow allows users to:
1. Click on a "+" button to start a new project
2. Fill out a form with essential project details
3. Save the project information to a Supabase database
4. Access tools that can reference the project details throughout the user's experience

## Setup Steps

### 1. Supabase Setup

1. Log in to your Supabase account and navigate to your project.
2. Go to the SQL Editor and run the SQL commands in the `supabase_setup.sql` file to create the necessary table and policies.

### 2. Environment Variables

Ensure the following environment variables are set in your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Project Structure

The project creation flow consists of:

- **Main Project Page** (`/project-helper`): Displays existing projects and has a "+" button to create new projects
- **Create Project Page** (`/project-helper/create`): Form for entering project details
- **Tools Page** (`/project-helper/tools`): Shows tools with access to project data after creation

### 4. Components and Files

- `src/app/project-helper/components/CreateProject.tsx`: The form component for creating projects
- `src/app/project-helper/create/page.tsx`: The page that renders the CreateProject component
- `src/app/project-helper/tools/page.tsx`: The tools page that shows after project creation
- `src/app/project-helper/actions/projects.ts`: Server actions for database operations
- `src/app/project-helper/page.tsx`: Main page with project listing and "+" button

## How It Works

1. User navigates to `/project-helper` and sees existing projects or an empty state
2. User clicks the "+" button to navigate to `/project-helper/create`
3. User fills out the project form and submits it
4. The data is saved to Supabase using a server action
5. User is redirected to `/project-helper/tools?projectId=[id]` to use tools that can access project data

## Customization

### Adding More Project Fields

To add more fields to the project form:

1. Update the `ProjectFormData` interface in `CreateProject.tsx`
2. Add the new fields to the form UI
3. Update the database schema in Supabase
4. Update the server action to include the new fields

### Adding More Tools

To add more tools that use project data:

1. Create new tool components in `src/app/project-helper/components/`
2. Add the tool to the tabs in `tools/page.tsx`
3. Implement functionality to fetch and use the project data 