"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getProjectById } from "../actions/projects";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import Link from "next/link";
import ProjectNavbar from "../components/ProjectNavbar";
import ProjectIdeation from "../components/ProjectIdeation";
import ProjectPlanner from "../components/ProjectPlanner";
import ResourceSuggestions from "../components/ResourceSuggestions";
import ProblemSolver from "../components/ProblemSolver";
import type { ProjectData, ResourceData, AssistantData } from "../types";

interface Project {
  id: string;
  name: string;
  grade: string;
  domain: string;
  description: string;
  created_at: string;
}

export default function ToolsPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("ideation");
  
  // States to track which tool process has been started
  const [ideationStarted, setIdeationStarted] = useState(false);
  const [plannerStarted, setPlannerStarted] = useState(false);
  const [resourcesStarted, setResourcesStarted] = useState(false);
  const [assistantStarted, setAssistantStarted] = useState(false);
  
  // States for data passing between components
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [resourceData, setResourceData] = useState<ResourceData | undefined>();
  const [assistantData, setAssistantData] = useState<AssistantData | undefined>();

  useEffect(() => {
    async function fetchProject() {
      if (!projectId) {
        setError("No project ID provided");
        setLoading(false);
        return;
      }

      try {
        const projectData = await getProjectById(projectId);
        setProject(projectData);
        
        // Initialize project data for components
        setProjectData({
          projectName: projectData.name,
          projectDescription: projectData.description,
          grade: projectData.grade,
          projectDomain: projectData.domain,
          id: projectData.id,
          duration: "unknown" // Default value
        });
        
      } catch (err) {
        console.error("Error fetching project:", err);
        setError("Failed to load project details");
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [projectId]);

  // Handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Handle starting different tool processes
  const handleStartIdeation = () => {
    setIdeationStarted(true);
  };
  
  const handleStartPlanner = () => {
    setPlannerStarted(true);
  };
  
  const handleStartResources = () => {
    setResourcesStarted(true);
  };
  
  const handleStartAssistant = () => {
    setAssistantStarted(true);
  };
  
  // Handlers for data passing between components
  const handleProjectDataGenerated = (data: ProjectData) => {
    setProjectData(data);
    setPlannerStarted(true); // Automatically start the planner after ideation
    setActiveTab("planner"); // Switch to planner tab
  };

  const handleResourceGeneration = (data: ResourceData) => {
    setResourceData(data);
    setResourcesStarted(true); // Ensure resources component is shown
    setActiveTab("resources"); // Switch to resources tab
  };

  const handleProjectAssistant = (data: any) => {
    setAssistantData({
      topic: data.topic,
      specificGoals: data.specificGoals,
      timeAvailable: data.timeAvailable,
      grade: data.grade,
      projectDomain: data.projectDomain,
      projectId: project?.id || null
    });
    setAssistantStarted(true); // Ensure assistant component is shown
    setActiveTab("assistant"); // Switch to assistant tab
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-6xl px-4 text-center">
        <p>Loading project details...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto py-8 max-w-6xl px-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-600">
          <p>{error || "Project not found"}</p>
          <Button asChild className="mt-4">
            <Link href="/project-helper">Back to Projects</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl px-4">
      <ProjectNavbar 
        project={{
          id: project.id,
          name: project.name,
          grade: project.grade,
          domain: project.domain
        }}
      />
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Project Details</h2>
        <p className="text-gray-700">{project.description}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-4 p-0 bg-gray-50 border-b rounded-t-lg">
            <TabsTrigger value="ideation" className="py-3 rounded-none data-[state=active]:bg-white">Project Ideation</TabsTrigger>
            <TabsTrigger value="planner" className="py-3 rounded-none data-[state=active]:bg-white">Project Planner</TabsTrigger>
            <TabsTrigger value="resources" className="py-3 rounded-none data-[state=active]:bg-white">Resource Suggestions</TabsTrigger>
            <TabsTrigger value="assistant" className="py-3 rounded-none data-[state=active]:bg-white">Project Assistant</TabsTrigger>
          </TabsList>

          <div className="p-6">
            <TabsContent value="ideation" className="mt-0">
              {!ideationStarted ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Project Ideation Tool</CardTitle>
                    <CardDescription>
                      Generate project ideas and explore possibilities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Enter details about your project idea to get suggestions and guidance.</p>
                    <div className="mt-4">
                      <Button 
                        className="bg-pink-600 hover:bg-pink-700 text-white"
                        onClick={handleStartIdeation}
                      >
                        Start Ideation Process
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <ProjectIdeation 
                  onProjectDataGenerated={handleProjectDataGenerated} 
                />
              )}
            </TabsContent>

            <TabsContent value="planner" className="mt-0">
              {!plannerStarted ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Project Planner Tool</CardTitle>
                    <CardDescription>
                      Plan your project workflow and timeline
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Create detailed plans for your project with step-by-step guidance.</p>
                    <div className="mt-4">
                      <Button 
                        className="bg-pink-600 hover:bg-pink-700 text-white"
                        onClick={handleStartPlanner}
                      >
                        Start Planning Process
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <ProjectPlanner 
                  projectData={projectData} 
                  onResourceGeneration={handleResourceGeneration} 
                />
              )}
            </TabsContent>

            <TabsContent value="resources" className="mt-0">
              {!resourcesStarted ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Resource Finder Tool</CardTitle>
                    <CardDescription>
                      Find resources relevant to your project
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Discover books, websites, tutorials, and other resources for your project.</p>
                    <div className="mt-4">
                      <Button 
                        className="bg-pink-600 hover:bg-pink-700 text-white"
                        onClick={handleStartResources}
                      >
                        Find Resources
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <ResourceSuggestions 
                  resourceData={resourceData || {
                    projectName: project.name,
                    projectDescription: project.description,
                    grade: project.grade,
                    projectDomain: project.domain
                  }} 
                  onProjectAssistant={handleProjectAssistant} 
                />
              )}
            </TabsContent>

            <TabsContent value="assistant" className="mt-0">
              {!assistantStarted ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Project Assistant</CardTitle>
                    <CardDescription>
                      Get AI assistance with your project challenges
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Ask questions and get guidance for overcoming obstacles in your project.</p>
                    <div className="mt-4">
                      <Button 
                        className="bg-pink-600 hover:bg-pink-700 text-white"
                        onClick={handleStartAssistant}
                      >
                        Chat with Assistant
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <ProblemSolver 
                  assistantData={assistantData || {
                    topic: project.name,
                    specificGoals: project.description,
                    timeAvailable: "unknown",
                    grade: project.grade,
                    projectDomain: project.domain,
                    projectId: project.id
                  }} 
                />
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
} 