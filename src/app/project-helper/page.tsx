"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "./components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import type { ProjectData, ResourceData, AssistantData, ProjectAssistantData } from "./types";
import ProjectIdeation from "./components/ProjectIdeation";
import ProjectPlanner from "./components/ProjectPlanner";
import ResourceSuggestions from "./components/ResourceSuggestions";
import ProblemSolver from "./components/ProblemSolver";
import { Card, CardContent } from "./components/ui/card";
import { PlusIcon } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import ProjectNavbar from "./components/ProjectNavbar";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Project {
  id: string;
  name: string;
  grade: string;
  domain: string;
  description: string;
  created_at: string;
}

export default function ProjectHelperPage() {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [resourceData, setResourceData] = useState<ResourceData | undefined>();
  const [assistantData, setAssistantData] = useState<AssistantData | undefined>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's projects
  useEffect(() => {
    async function fetchProjects() {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching projects:', error);
        } else {
          setProjects(data || []);
        }
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  const handleProjectDataGenerated = (data: ProjectData) => {
    setProjectData(data);
  };

  const handleResourceGeneration = (data: ResourceData) => {
    setResourceData(data);
  };

  const handleProjectAssistant = (data: ProjectAssistantData) => {
    setAssistantData({
      topic: data.topic,
      specificGoals: data.specificGoals,
      timeAvailable: data.timeAvailable,
      grade: data.grade,
      projectDomain: data.projectDomain,
    });
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl px-4">
      <ProjectNavbar 
        showBack={false} 
        showNewProject={false}
      />
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-pink-600">Your Projects</h1>
        <Button 
          asChild 
          className="bg-pink-600 hover:bg-pink-700"
        >
          <Link href="/project-helper/create">
            <PlusIcon className="h-5 w-5 mr-1" />
            New Project
          </Link>
        </Button>
      </div>

      <p className="text-gray-700 mb-6">
        Create and manage your educational projects with AI-powered assistance.
      </p>

      {/* Display existing projects if available */}
      {projects.length > 0 && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{project.name}</h3>
                  <div className="text-sm text-gray-500 mb-2">
                    <span className="mr-3">Grade: {project.grade}</span>
                    <span>Domain: {project.domain}</span>
                  </div>
                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  <Button 
                    asChild 
                    variant="outline" 
                    className="w-full"
                  >
                    <Link href={`/project-helper/tools?projectId=${project.id}`}>
                      Open Project
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Show loading state or empty state */}
      {loading ? (
        <p className="text-center py-8">Loading your projects...</p>
      ) : projects.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-4">You don't have any projects yet.</p>
          <Button 
            asChild 
            className="bg-pink-600 hover:bg-pink-700"
          >
            <Link href="/project-helper/create">
              <PlusIcon className="h-5 w-5 mr-1" />
              Create your first project
            </Link>
          </Button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border mt-8">
        <Tabs defaultValue="ideation" className="w-full">
          <TabsList className="grid grid-cols-4 p-0 bg-gray-50 border-b rounded-t-lg">
            <TabsTrigger value="ideation" className="py-3 rounded-none data-[state=active]:bg-white">Project Ideation</TabsTrigger>
            <TabsTrigger value="planner" className="py-3 rounded-none data-[state=active]:bg-white">Project Planner</TabsTrigger>
            <TabsTrigger value="resources" className="py-3 rounded-none data-[state=active]:bg-white">Resource Suggestions</TabsTrigger>
            <TabsTrigger value="assistant" className="py-3 rounded-none data-[state=active]:bg-white">Project Assistant</TabsTrigger>
          </TabsList>

          <div className="p-6">
            <TabsContent value="ideation" className="mt-0">
              <ProjectIdeation onProjectDataGenerated={handleProjectDataGenerated} />
            </TabsContent>

            <TabsContent value="planner" className="mt-0">
              <ProjectPlanner 
                projectData={projectData} 
                onResourceGeneration={handleResourceGeneration} 
              />
            </TabsContent>

            <TabsContent value="resources" className="mt-0">
              <ResourceSuggestions 
                resourceData={resourceData} 
                onProjectAssistant={handleProjectAssistant} 
              />
            </TabsContent>

            <TabsContent value="assistant" className="mt-0">
              <ProblemSolver assistantData={assistantData} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
} 