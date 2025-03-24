# Project Diagram Builder Component

This document provides information about the Project Diagram Builder component that has been integrated into the Teaching Apps platform.

## Overview

The Project Diagram Builder is a powerful tool that allows users to create interactive diagrams for their projects, including:

1. Business Model Canvas
2. Lean Canvas
3. (More diagram types can be added in the future)

The component uses React Flow for the diagramming functionality and integrates seamlessly with the existing Next.js, Supabase, and Groq stack.

## Features

- Interactive diagram creation with draggable nodes
- Multiple diagram templates (Business Model Canvas, Lean Canvas)
- Automatic saving of diagrams to Supabase
- Integration with the project assistant
- Responsive design

## Technical Implementation

### Database Schema

The component adds a new `project_diagrams` table to Supabase with the following structure:

```sql
CREATE TABLE IF NOT EXISTS project_diagrams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  diagram_type TEXT NOT NULL,
  nodes JSONB NOT NULL DEFAULT '[]',
  edges JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Components

- `DiagramBuilder.tsx`: Main component for the diagram builder interface
- `actions/diagrams.ts`: Server actions for diagram operations

### User Flow

1. User creates or selects a project
2. User navigates through the project tools flow
3. After Resource Suggestions, the user is presented with the Diagram Builder
4. User can select a diagram type and create/edit their diagram
5. User can save the diagram at any time
6. User can continue to the Project Assistant with their diagram data

## Setup Instructions

### 1. Database Migration

Run the SQL migrations in the Supabase dashboard:

1. `00_initial_setup.sql`: Enables the UUID extension
2. `20240623_add_project_diagrams.sql`: Creates the project_diagrams table

### 2. Environment Variables

Make sure your `.env.local` file contains the Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Dependencies

The component requires the following npm packages:

```
npm install @xyflow/react zustand
```

## Usage

The Diagram Builder has been added to the tools flow between Resource Suggestions and Project Assistant:

1. Project Ideation
2. Project Planner
3. Resource Suggestions
4. **Diagram Builder** (new)
5. Project Assistant

## Extending the Component

### Adding New Diagram Templates

To add a new diagram template:

1. Define the new template sections in `DiagramBuilder.tsx` similar to `bmcSections` and `leanSections`
2. Add the new option to the diagram type select dropdown
3. Update the useEffect hook to handle the new diagram type

### Customizing Node Appearance

The appearance of diagram nodes can be customized in the `CanvasNode` component within `DiagramBuilder.tsx`.

## Troubleshooting

If diagrams are not saving properly:

1. Check that your Supabase credentials are correct
2. Verify that the `project_diagrams` table exists in your database
3. Check the browser console for any error messages
4. Ensure that the project_id is being passed correctly

## Future Enhancements

Potential future enhancements for this component:

1. Add more diagram templates (SWOT Analysis, Project Canvas, etc.)
2. Enable collaborative editing for team projects
3. Add ability to export diagrams as images or PDFs
4. Add AI suggestions for diagram content based on project details 