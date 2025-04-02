"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { getProjectById } from "../actions/projects";
import { getDiagramByProjectId, getDiagramHistoryByProjectId, getDiagramById, saveDiagram } from "../actions/diagrams";
import { getIdeationHistoryByProjectId, getIdeationById } from "../actions/ideation";
import { getPlannerHistoryByProjectId, getPlannerById } from "../actions/planners";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import Link from "next/link";
import ProjectNavbar from "../components/ProjectNavbar";
import ProjectIdeation from "../components/ProjectIdeation";
import ProjectPlanner from "../components/ProjectPlanner";
import ResourceSuggestions from "../components/ResourceSuggestions";
import { DiagramBuilder } from "../components/diagram-builder";
import ProblemSolver from "../components/ProblemSolver";
import type { ProjectData, ResourceData, AssistantData, DiagramData } from "../types";
import { AssistantDataFromPage } from "../components/diagram-builder/types";
import { Node, Edge } from "reactflow";

interface Project {
  id: string;
  name: string;
  grade: string;
  domain: string;
  description: string;
  created_at: string;
}

// Add new type for diagram template selection
type DiagramTemplate = 'blank' | 'flowchart' | 'mindmap' | 'businessCanvas' | 'leanCanvas';

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
  const [diagramStarted, setDiagramStarted] = useState(false);
  const [assistantStarted, setAssistantStarted] = useState(false);
  
  // Add new state for selected diagram template
  const [selectedDiagramTemplate, setSelectedDiagramTemplate] = useState<DiagramTemplate | null>(null);
  
  // States for data passing between components
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [resourceData, setResourceData] = useState<ResourceData | undefined>();
  const [diagramData, setDiagramData] = useState<{
    id?: string;
    name?: string;
    diagramType?: string;
    projectName?: string;
    projectDescription?: string;
    grade?: string;
    projectDomain?: string;
    projectId?: string;
    nodes: Node[];
    edges: Edge[];
  } | undefined>();
  const [toolContextData, setToolContextData] = useState<AssistantData | undefined | null>();
  const [assistantData, setAssistantData] = useState<AssistantData | null>(null);
  const [initialAssistantMessage, setInitialAssistantMessage] = useState<string | null>(null);

  // Add a function to fetch diagram history
  interface DiagramHistoryItem {
    id: string;
    name: string;
    diagramType?: string;
    createdAt: string;
    lastModified: string;
    previewImage?: string;
    description?: string;
  }
  
  const [diagramHistory, setDiagramHistory] = useState<DiagramHistoryItem[]>([]);
  const [loadingDiagramHistory, setLoadingDiagramHistory] = useState(false);

  // Add state for ideation history
  interface IdeationHistoryItem {
    id: string;
    name: string;
    subject?: string;
    projectDomain?: string;
    createdAt: string;
    lastModified: string;
    preview?: string;
  }
  
  const [ideationHistory, setIdeationHistory] = useState<IdeationHistoryItem[]>([]);
  const [loadingIdeationHistory, setLoadingIdeationHistory] = useState(false);
  
  // Add state for planner history
  interface PlannerHistoryItem {
    id: string;
    name: string;
    projectName?: string;
    projectDomain?: string;
    createdAt: string;
    lastModified: string;
    preview?: string;
  }
  
  const [plannerHistory, setPlannerHistory] = useState<PlannerHistoryItem[]>([]);
  const [loadingPlannerHistory, setLoadingPlannerHistory] = useState(false);

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
        
        // Try to load diagram data if exists
        const diagram = await getDiagramByProjectId(projectId);
        if (diagram) {
          setDiagramData({
            diagramType: diagram.diagramType,
            projectName: projectData.name,
            projectDescription: projectData.description,
            grade: projectData.grade,
            projectDomain: projectData.domain,
            projectId: projectId,
            nodes: diagram.nodes || [],
            edges: diagram.edges || []
          });
        }
        
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
    
    // Remove the auto-start behavior for diagram tab
    // if (value === "diagram") {
    //   setDiagramStarted(true);
    // }
    
    console.log("Tab changed to:", value);
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
  
  const handleStartDiagram = () => {
    setDiagramStarted(true);
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
    console.log('handleResourceGeneration called with:', data);
    setResourceData(data);
    // Remove auto-start behavior - don't automatically start diagram builder
    // setDiagramStarted(true);
    setActiveTab("diagram"); // Still switch to diagram tab
  };
  
  // Update fetchDiagramHistory to use the database function
  const fetchDiagramHistory = useCallback(async () => {
    if (!projectId) return;
    
    setLoadingDiagramHistory(true);
    try {
      // Call the server action to get diagram history from database
      const historyData = await getDiagramHistoryByProjectId(projectId);
      setDiagramHistory(historyData);
    } catch (error) {
      console.error("Error fetching diagram history:", error);
    } finally {
      setLoadingDiagramHistory(false);
    }
  }, [projectId]);
  
  // Fetch diagram history when the tab changes to diagram
  useEffect(() => {
    if (activeTab === "diagram" && !diagramStarted) {
      fetchDiagramHistory();
    }
  }, [activeTab, diagramStarted, fetchDiagramHistory]);

  // Add template selection handler
  const handleSelectDiagramTemplate = (template: DiagramTemplate) => {
    console.log(`Selected diagram template: ${template}`);
    setSelectedDiagramTemplate(template);
    setDiagramStarted(true);
  };

  // Function to load a specific diagram from history
  const handleLoadDiagram = async (diagramId: string) => {
    console.log(`Loading diagram with ID: ${diagramId}`);
    try {
      const diagramData = await getDiagramById(diagramId);
      if (diagramData) {
        setDiagramData({
          diagramType: diagramData.diagramType,
          projectName: projectData?.projectName || project?.name || "",
          projectDescription: projectData?.projectDescription || project?.description || "",
          grade: projectData?.grade || project?.grade || "",
          projectDomain: projectData?.projectDomain || project?.domain || "",
          projectId: projectId || undefined, // Convert null to undefined
          nodes: diagramData.nodes || [],
          edges: diagramData.edges || []
        });
        setDiagramStarted(true);
      }
    } catch (error) {
      console.error("Error loading diagram:", error);
      // Fallback: start a new diagram if loading fails
      setDiagramStarted(true);
    }
  };
  
  // Simplify diagram creation by providing a single button to create a canvas
  const handleCreateCanvas = () => {
    console.log("Creating new project canvas");
    // Reset any existing diagram data
    setDiagramData({
      diagramType: "canvas",
      projectName: projectData?.projectName || project?.name || "",
      projectDescription: projectData?.projectDescription || project?.description || "",
      grade: projectData?.grade || project?.grade || "",
      projectDomain: projectData?.projectDomain || project?.domain || "",
      projectId: projectId || undefined, // Convert null to undefined
      nodes: [],
      edges: []
    });
    setSelectedDiagramTemplate(null);
    setDiagramStarted(true);
  };

  // Update handler
  const handleToolContextData = (data: any) => {
    console.log('[handleToolContextData] Function called with data:', JSON.stringify(data).substring(0, 500) + '...');
    
    // Add explicit validation and debug logs
    if (!data) {
      console.error('[handleToolContextData] Called with null or undefined data');
      return;
    }
    
    // Convert data to the format expected by the assistant
    const assistantData: AssistantData = {
      topic: data.topic || 'Project Analysis',
      specificGoals: data.specificGoals || [],
      timeAvailable: data.timeAvailable || '',
      grade: data.grade || '',
      projectDomain: data.projectDomain || '',
      projectId: data.projectId || '',
    };

    // Create initial message with diagram content if available
    let initialMessage = `I need help with a project on ${data.topic || 'this project'}.`;
    
    if (data.specificGoals && data.specificGoals.length > 0) {
      initialMessage += ` My specific goals are: ${data.specificGoals.join(', ')}.`;
    }
    
    if (data.diagramContent) {
      initialMessage += `\n\nHere is the diagram I've created:\n\n${data.diagramContent}`;
      console.log("[handleToolContextData] Diagram content found, adding to initial message");
    } else {
      console.log("[handleToolContextData] No diagram content found in the data");
      // If no diagram content but we have nodes, add a note about it
      if (data.nodes && data.nodes.length > 0) {
        initialMessage += "\n\nI've created a diagram with " + data.nodes.length + " elements.";
      }
    }
    
    console.log("[handleToolContextData] Setting assistant data:", JSON.stringify(assistantData));
    console.log("[handleToolContextData] Setting initial message:", initialMessage.substring(0, 100) + "...");
    
    // Set the state for the assistant
    setAssistantData(assistantData);
    setInitialAssistantMessage(initialMessage);
    
    // Navigate to the assistant page - ensure this always happens
    console.log("[handleToolContextData] Activating assistant tab");
    setAssistantStarted(true);
    
    // Use setTimeout to ensure state updates before tab change
    setTimeout(() => {
      console.log("[handleToolContextData] Setting active tab to assistant");
      setActiveTab("assistant");
    }, 0);
    
    console.log("[handleToolContextData] Function completed");
  };

  const handleProjectAssistant = (data: any) => {
    console.warn('handleProjectAssistant called - consider integrating with handleToolContextData if providing context:', data);
    setAssistantStarted(true); // Ensure assistant component is shown
    setActiveTab("assistant"); // Switch to assistant tab
  };

  // Handle diagram save
  const handleSaveDiagram = async (data: any) => {
    console.log('Saving diagram:', data);
    try {
      // Prepare data for saving
      const saveData = {
        id: diagramData?.id, // Use existing ID if present (update) or undefined for new
        name: data.name || `Project Diagram ${new Date().toLocaleDateString()}`,
        diagramType: data.diagramType || diagramData?.diagramType || 'custom',
        nodes: data.nodes,
        edges: data.edges,
        projectId: projectId || undefined, // Convert null to undefined
        description: data.description || '',
        // Generate thumbnail if possible (in a real app you'd create an actual thumbnail)
        thumbnail: '/project-helper/diagram-preview-placeholder.png'
      };
      
      // Call the server action to save diagram
      const result = await saveDiagram(saveData);
      
      if (result.success) {
        // Update the diagramData state with saved info
        setDiagramData(prevData => {
          if (!prevData) return undefined;
          
          return {
            ...prevData,
            id: result.id,
            name: result.name
          };
        });
        
        // Refresh diagram history to include this new/updated diagram
        fetchDiagramHistory();
        
        // Show success message (in a production app, use a toast notification)
        console.log('Diagram saved successfully:', result.message);
      } else {
        console.error('Failed to save diagram:', result.message);
      }
    } catch (error) {
      console.error('Error saving diagram:', error);
    }
  };

  // Add function to fetch ideation history
  const fetchIdeationHistory = useCallback(async () => {
    if (!projectId) return;
    
    setLoadingIdeationHistory(true);
    try {
      // Call the server action to get ideation history from database
      const historyData = await getIdeationHistoryByProjectId(projectId);
      setIdeationHistory(historyData);
    } catch (error) {
      console.error("Error fetching ideation history:", error);
    } finally {
      setLoadingIdeationHistory(false);
    }
  }, [projectId]);
  
  // Add function to fetch planner history
  const fetchPlannerHistory = useCallback(async () => {
    if (!projectId) return;
    
    setLoadingPlannerHistory(true);
    try {
      // Call the server action to get planner history from database
      const historyData = await getPlannerHistoryByProjectId(projectId);
      setPlannerHistory(historyData);
    } catch (error) {
      console.error("Error fetching planner history:", error);
    } finally {
      setLoadingPlannerHistory(false);
    }
  }, [projectId]);
  
  // Fetch history when tabs change
  useEffect(() => {
    if (activeTab === "ideation" && !ideationStarted) {
      fetchIdeationHistory();
    } else if (activeTab === "planner" && !plannerStarted) {
      fetchPlannerHistory();
    } else if (activeTab === "diagram" && !diagramStarted) {
      fetchDiagramHistory();
    }
  }, [activeTab, ideationStarted, plannerStarted, diagramStarted, fetchIdeationHistory, fetchPlannerHistory, fetchDiagramHistory]);
  
  // Function to load a specific ideation from history
  const handleLoadIdeation = async (ideationId: string) => {
    console.log(`Loading ideation with ID: ${ideationId}`);
    try {
      // Simply set the flag to start ideation and let the component handle loading
      setIdeationStarted(true);
      // Store the ID in the URL, which can be accessed by the components
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set('ideationId', ideationId);
      const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
      window.history.pushState({}, '', newUrl);
    } catch (error) {
      console.error("Error loading ideation:", error);
      setIdeationStarted(true);
    }
  };
  
  // Function to load a specific planner from history
  const handleLoadPlanner = async (plannerId: string) => {
    console.log(`Loading planner with ID: ${plannerId}`);
    try {
      // Simply set the flag to start planner and let the component handle loading
      setPlannerStarted(true);
      // Store the ID in the URL, which can be accessed by the components
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set('plannerId', plannerId);
      const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
      window.history.pushState({}, '', newUrl);
    } catch (error) {
      console.error("Error loading planner:", error);
      setPlannerStarted(true);
    }
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
          <TabsList className="grid grid-cols-5 p-0 bg-gray-50 border-b rounded-t-lg">
            <TabsTrigger value="ideation" className="py-3 rounded-none data-[state=active]:bg-white">Project Ideation</TabsTrigger>
            <TabsTrigger value="planner" className="py-3 rounded-none data-[state=active]:bg-white">Project Planner</TabsTrigger>
            <TabsTrigger value="resources" className="py-3 rounded-none data-[state=active]:bg-white">Resource Suggestions</TabsTrigger>
            <TabsTrigger value="diagram" className="py-3 rounded-none data-[state=active]:bg-white">Diagram Builder</TabsTrigger>
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
                    {/* Previous Ideations Section */}
                    {ideationHistory.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-base font-medium mb-4">Previous Ideations</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {ideationHistory.map(ideation => (
                            <div 
                              key={ideation.id}
                              className="border rounded-lg overflow-hidden hover:border-pink-300 transition-colors cursor-pointer"
                              onClick={() => handleLoadIdeation(ideation.id)}
                            >
                              <div className="p-3">
                                <div className="font-medium text-sm">{ideation.name}</div>
                                <div className="text-xs text-gray-500 mb-2">Last modified: {new Date(ideation.lastModified).toLocaleDateString()}</div>
                                <div className="text-xs line-clamp-3 text-gray-600">{ideation.preview}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {loadingIdeationHistory ? (
                      <div className="text-center py-4">
                        <p>Loading ideation history...</p>
                      </div>
                    ) : ideationHistory.length === 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 text-center mb-8">
                        <p className="text-gray-600 mb-2">No previous ideations found</p>
                        <p className="text-sm text-gray-500">Start creating your first project idea</p>
                      </div>
                    )}
                    
                    <p className="mt-4">Enter details about your project idea to get suggestions and guidance.</p>
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
                  projectId={projectId}
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
                    {/* Previous Planners Section */}
                    {plannerHistory.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-base font-medium mb-4">Previous Plans</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {plannerHistory.map(planner => (
                            <div 
                              key={planner.id}
                              className="border rounded-lg overflow-hidden hover:border-pink-300 transition-colors cursor-pointer"
                              onClick={() => handleLoadPlanner(planner.id)}
                            >
                              <div className="p-3">
                                <div className="font-medium text-sm">{planner.name}</div>
                                <div className="text-xs text-gray-500 mb-2">Last modified: {new Date(planner.lastModified).toLocaleDateString()}</div>
                                <div className="text-xs line-clamp-3 text-gray-600">{planner.preview}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {loadingPlannerHistory ? (
                      <div className="text-center py-4">
                        <p>Loading plan history...</p>
                      </div>
                    ) : plannerHistory.length === 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 text-center mb-8">
                        <p className="text-gray-600 mb-2">No previous plans found</p>
                        <p className="text-sm text-gray-500">Start creating your first project plan</p>
                      </div>
                    )}
                    
                    <p className="mt-4">Create detailed plans for your project with step-by-step guidance.</p>
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
            
            <TabsContent value="diagram" className="mt-0">
              {!diagramStarted ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Project Diagram Builder</CardTitle>
                    <CardDescription>
                      Create visual diagrams for your project structure
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Previous Diagrams Section */}
                    {diagramHistory.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-base font-medium mb-4">Previous Diagrams</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {diagramHistory.map(diagram => (
                            <div 
                              key={diagram.id}
                              className="border rounded-lg overflow-hidden hover:border-pink-300 transition-colors cursor-pointer"
                              onClick={() => handleLoadDiagram(diagram.id)}
                            >
                              {diagram.previewImage ? (
                                <div className="h-32 bg-gray-100 flex items-center justify-center">
                                  <img 
                                    src={diagram.previewImage} 
                                    alt={`Preview of ${diagram.name}`}
                                    className="max-h-full max-w-full object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="h-32 bg-gray-100 flex items-center justify-center text-gray-400">
                                  No preview available
                                </div>
                              )}
                              <div className="p-3">
                                <div className="font-medium text-sm">{diagram.name}</div>
                                <div className="text-xs text-gray-500">Last modified: {new Date(diagram.lastModified).toLocaleDateString()}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {loadingDiagramHistory ? (
                      <div className="text-center py-4">
                        <p>Loading diagram history...</p>
                      </div>
                    ) : diagramHistory.length === 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 text-center mb-8">
                        <p className="text-gray-600 mb-2">No previous diagrams found</p>
                        <p className="text-sm text-gray-500">Start creating your first diagram</p>
                      </div>
                    )}
                    
                    {/* Simplified Create New Diagram Section */}
                    <div className="mt-6 text-center">
                      <Button 
                        className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-6 text-lg"
                        onClick={handleCreateCanvas}
                      >
                        Build Your Project Canvas
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-[700px]">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle>Project Diagram Builder</CardTitle>
                      {selectedDiagramTemplate && selectedDiagramTemplate !== 'blank' && (
                        <CardDescription>
                          {selectedDiagramTemplate === 'businessCanvas' && 'Business Model Canvas'} 
                          {selectedDiagramTemplate === 'leanCanvas' && 'Lean Canvas'}
                          {selectedDiagramTemplate === 'flowchart' && 'Flow Chart'}
                          {selectedDiagramTemplate === 'mindmap' && 'Mind Map'}
                        </CardDescription>
                      )}
                    </div>
                    
                    {/* Add Back Button */}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setDiagramStarted(false)}
                      className="text-sm"
                    >
                      Back to Diagrams
                    </Button>
                  </CardHeader>
                  <CardContent className="h-[650px] flex flex-col">
                    <DiagramBuilder 
                      diagramData={diagramData}
                      projectData={projectData}
                      onAssistantData={handleToolContextData}
                      onSave={handleSaveDiagram}
                      templateType={
                        selectedDiagramTemplate !== null && 
                        selectedDiagramTemplate !== 'blank' ? 
                        selectedDiagramTemplate : undefined
                      }
                    />
                  </CardContent>
                </Card>
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
                  projectData={projectData}
                  toolContext={assistantData}
                  initialMessage={initialAssistantMessage}
                />
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}