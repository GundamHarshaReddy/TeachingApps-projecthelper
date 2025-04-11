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
import { useRouter, useSearchParams } from 'next/navigation';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Session keys for form data
const SESSION_KEYS = {
  PROJECT_DATA: 'project_helper_project_data',
  RESOURCE_DATA: 'project_helper_resource_data',
  ASSISTANT_DATA: 'project_helper_assistant_data',
};

interface Project {
  id: string;
  name: string;
  grade: string;
  domain: string;
  description: string;
  created_at: string;
}

function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) { return "st"; }
  if (j === 2 && k !== 12) { return "nd"; }
  if (j === 3 && k !== 13) { return "rd"; }
  return "th";
}

export default function ProjectHelperPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'ideation';

  // Initialize state with session data if available
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [resourceData, setResourceData] = useState<ResourceData | undefined>();
  const [assistantData, setAssistantData] = useState<AssistantData | undefined>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab);

  // Load saved form data from sessionStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedProjectData = sessionStorage.getItem(SESSION_KEYS.PROJECT_DATA);
        const savedResourceData = sessionStorage.getItem(SESSION_KEYS.RESOURCE_DATA);
        const savedAssistantData = sessionStorage.getItem(SESSION_KEYS.ASSISTANT_DATA);
        
        if (savedProjectData) setProjectData(JSON.parse(savedProjectData));
        if (savedResourceData) setResourceData(JSON.parse(savedResourceData));
        if (savedAssistantData) setAssistantData(JSON.parse(savedAssistantData));
      } catch (error) {
        console.error('Error loading session data:', error);
      }
    }
  }, []);

  // Listen for popstate events (back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      // When user navigates with browser back/forward buttons,
      // we want to reload the data from sessionStorage
      try {
        const savedProjectData = sessionStorage.getItem(SESSION_KEYS.PROJECT_DATA);
        const savedResourceData = sessionStorage.getItem(SESSION_KEYS.RESOURCE_DATA);
        const savedAssistantData = sessionStorage.getItem(SESSION_KEYS.ASSISTANT_DATA);
        
        if (savedProjectData) setProjectData(JSON.parse(savedProjectData));
        if (savedResourceData) setResourceData(JSON.parse(savedResourceData));
        if (savedAssistantData) setAssistantData(JSON.parse(savedAssistantData));
      } catch (error) {
        console.error('Error loading session data on popstate:', error);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Update activeTab state if URL changes
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') || 'ideation';
    if (tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, activeTab]);

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

  // Save data to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (projectData) {
        sessionStorage.setItem(SESSION_KEYS.PROJECT_DATA, JSON.stringify(projectData));
      }
      if (resourceData) {
        sessionStorage.setItem(SESSION_KEYS.RESOURCE_DATA, JSON.stringify(resourceData));
      }
      if (assistantData) {
        sessionStorage.setItem(SESSION_KEYS.ASSISTANT_DATA, JSON.stringify(assistantData));
      }
    }
  }, [projectData, resourceData, assistantData]);

  const handleProjectDataGenerated = (data: ProjectData) => {
    setProjectData(data);
  };

  const handleResourceGeneration = (data: ResourceData) => {
    setResourceData(data);
  };

  const handleProjectAssistant = (data: ProjectAssistantData) => {
    setAssistantData({
      topic: data.topic,
      specificGoals: [data.specificGoals],
      timeAvailable: data.timeAvailable,
      grade: data.grade,
      projectDomain: data.projectDomain,
    });
  };

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    router.push(`/project-helper?tab=${newTab}`, { scroll: false });
  };

  // Clear session data when starting a new project
  const handleNewProject = () => {
    // Clear session storage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(SESSION_KEYS.PROJECT_DATA);
      sessionStorage.removeItem(SESSION_KEYS.RESOURCE_DATA);
      sessionStorage.removeItem(SESSION_KEYS.ASSISTANT_DATA);
    }
    
    // Navigate to create page
    router.push('/project-helper/create');
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl px-4">
      <ProjectNavbar showNewProject={false} />
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-pink-600">Your Projects</h1>
        <Button 
          onClick={handleNewProject}
          className="bg-pink-600 hover:bg-pink-700"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          New Project
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
                    <span className="mr-3">Grade: {project.grade}{getOrdinalSuffix(parseInt(project.grade, 10))} Grade</span>
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
            onClick={handleNewProject}
            className="bg-pink-600 hover:bg-pink-700"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Create your first project
          </Button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border mt-8">
        <Tabs 
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
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
              <ProblemSolver 
                projectData={projectData} 
                toolContext={assistantData}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
} 