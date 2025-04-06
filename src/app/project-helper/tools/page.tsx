"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { getProjectById } from "../actions/projects";
import { getDiagramByProjectId, getDiagramHistoryByProjectId, getDiagramById, saveDiagram, deleteDiagramById } from "../actions/diagrams";
import { getIdeationHistoryByProjectId, getIdeationById, deleteIdeationById } from "../actions/ideation";
import { getPlannerHistoryByProjectId, getPlannerById, deletePlannerById } from "../actions/planners";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { Maximize, Info, ArrowLeft, Trash2 } from "lucide-react";

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
    diagramType: string;
    createdAt: string;
    lastModified: string;
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

  const [isDiagramFullScreen, setIsDiagramFullScreen] = useState(false);

  // Add reference to current diagram state that can be updated from the fullscreen DiagramBuilder
  const currentDiagramRef = useRef<{
    nodes: any[];
    edges: any[];
    name?: string;
    diagramType?: string;
  }>({ nodes: [], edges: [] });

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
    if (!projectId) {
      console.warn("Cannot fetch diagram history - no projectId provided");
      return;
    }
    
    setLoadingDiagramHistory(true);
    console.log(`Fetching diagram history for project: ${projectId}`);
    
    try {
      // Call the server action to get diagram history from database
      const historyData = await getDiagramHistoryByProjectId(projectId);
      console.log(`Received ${historyData.length} diagrams in history`, historyData);
      setDiagramHistory(historyData);
    } catch (error) {
      console.error("Error fetching diagram history:", error);
      // Show a user-friendly error
      alert("Failed to load diagram history. Please try again.");
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
    console.log(`Attempting to load diagram with ID: ${diagramId}`);
    try {
      const diagramData = await getDiagramById(diagramId);
      
      if (!diagramData) {
        console.error(`No diagram data returned for ID: ${diagramId}`);
        alert("Could not load the diagram. It may have been deleted.");
        return;
      }
      
      console.log(`Successfully fetched diagram: ${diagramData.name} (${diagramData.id})`);
      
      setDiagramData({
        id: diagramData.id,
        name: diagramData.name,
        diagramType: diagramData.diagramType,
        projectName: projectData?.projectName || project?.name || "",
        projectDescription: projectData?.projectDescription || project?.description || "",
        grade: projectData?.grade || project?.grade || "",
        projectDomain: projectData?.projectDomain || project?.domain || "",
        projectId: projectId || undefined, // Convert null to undefined
        nodes: diagramData.nodes || [],
        edges: diagramData.edges || []
      });
      
      console.log(`Diagram loaded with ${diagramData.nodes?.length || 0} nodes and ${diagramData.edges?.length || 0} edges`);
      setDiagramStarted(true);
    } catch (error) {
      console.error("Error loading diagram:", error);
      alert("An error occurred while loading the diagram. Please try again later.");
      // Don't automatically start a new diagram on error
    }
  };
  
  // Simplify diagram creation by providing a single button to create a canvas
  const handleCreateCanvas = () => {
    console.log("Creating new project canvas");
    // Reset any existing diagram data
    const projectName = projectData?.projectName || project?.name || "Project";
    setDiagramData({
      diagramType: "canvas",
      name: `${projectName} Diagram`, // Set a default name for new diagrams
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
    console.log('[handleSaveDiagram] Starting with data:', {
      id: data.id,
      name: data.name,
      nodeCount: data.nodes?.length || 0,
      edgeCount: data.edges?.length || 0,
    });
    
    try {
      // Check if we have an existing ID to determine if this is an update
      const existingId = data.id || diagramData?.id;
      console.log(`[handleSaveDiagram] Diagram ${existingId ? 'update' : 'new creation'}`);
      
      // Prepare data for saving
      const saveData = {
        id: existingId, // Use existing ID if present (update) or undefined for new
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
        console.log(`[handleSaveDiagram] Save successful: ${result.id} - ${result.name}`);
        
        // Update the diagramData state with saved info to ensure consistency
        setDiagramData(prevData => {
          if (!prevData) {
            console.warn('[handleSaveDiagram] No previous diagram data to update');
            return {
              id: result.id,
              name: result.name,
              diagramType: saveData.diagramType,
              nodes: saveData.nodes,
              edges: saveData.edges,
              projectId: saveData.projectId,
              description: saveData.description || '',
              // Add other required fields
              projectName: projectData?.projectName || '',
              projectDescription: projectData?.projectDescription || '',
              grade: projectData?.grade || '',
              projectDomain: projectData?.projectDomain || '',
            };
          }
          
          console.log('[handleSaveDiagram] Updating diagramData with saved values');
          return {
            ...prevData,
            id: result.id,
            name: result.name
          };
        });
        
        // Refresh diagram history to include this new/updated diagram
        fetchDiagramHistory();
        
        // Show success message with different text for update vs new creation
        const actionType = existingId ? 'updated' : 'saved as';
        console.log(`[handleSaveDiagram] Diagram ${actionType} "${result.name || 'Unnamed Diagram'}" successfully`);
        alert(`Diagram ${actionType} "${result.name || 'Unnamed Diagram'}" successfully`);
      } else {
        console.error('[handleSaveDiagram] Failed to save diagram:', result.message);
        alert(`Failed to save diagram: ${result.message}`);
      }
    } catch (error) {
      console.error('[handleSaveDiagram] Error:', error);
      alert('An error occurred while saving the diagram');
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
  
  // Fetch history when tabs change or project ID loads
  useEffect(() => {
    console.log(`[Effect] Running history fetch effect. ActiveTab: ${activeTab}, ProjectId: ${projectId}`);
    if (projectId) { // Ensure projectId is available
      if (activeTab === "ideation" && !ideationStarted) {
        console.log("[Effect] Fetching ideation history...");
        fetchIdeationHistory();
      } else if (activeTab === "planner" && !plannerStarted) {
        console.log("[Effect] Fetching planner history...");
        fetchPlannerHistory();
      } else if (activeTab === "diagram" && !diagramStarted) {
        console.log("[Effect] Fetching diagram history...");
        fetchDiagramHistory();
      }
    } else {
      console.log("[Effect] Skipping history fetch - projectId not yet available.");
    }
  }, [activeTab, ideationStarted, plannerStarted, diagramStarted, fetchIdeationHistory, fetchPlannerHistory, fetchDiagramHistory, projectId]); // Add projectId dependency
  
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

  const toggleDiagramFullScreen = useCallback(() => {
    // If we're currently in fullscreen and switching back to normal mode,
    // we need to ensure the diagramData is preserved
    if (isDiagramFullScreen) {
      console.log("[toggleDiagramFullScreen] Preserving diagram data when exiting fullscreen");
      
      // Use the captured state from the ref to update the diagramData
      setDiagramData(prevData => ({
        ...prevData,
        nodes: currentDiagramRef.current.nodes || prevData.nodes,
        edges: currentDiagramRef.current.edges || prevData.edges
      }));
    }
    
    // Toggle fullscreen state
    setIsDiagramFullScreen(prev => !prev);
  }, [isDiagramFullScreen]);

  // Create a handler to capture the current diagram state in fullscreen mode
  const handleFullscreenUpdate = useCallback((data: any) => {
    // Store the current diagram state in the ref
    currentDiagramRef.current = {
      nodes: data.nodes || [],
      edges: data.edges || [],
      name: data.name,
      diagramType: data.diagramType
    };
    
    console.log("[handleFullscreenUpdate] Captured diagram state:", {
      nodeCount: data.nodes?.length || 0,
      edgeCount: data.edges?.length || 0
    });
  }, []);

  // Add handler for deleting diagrams
  const handleDeleteDiagram = async (diagramId: string, diagramName: string | undefined) => {
    const displayName = diagramName || "Unnamed Diagram";
    console.log(`[handleDeleteDiagram] Attempting to delete diagram: ${diagramId} - ${displayName}`);
    
    // Confirm before deleting
    if (!confirm(`Are you sure you want to delete "${displayName}"? This action cannot be undone.`)) {
      console.log(`[handleDeleteDiagram] Delete cancelled by user`);
      return;
    }
    
    try {
      // Call the server action to delete the diagram
      const deleted = await deleteDiagramById(diagramId);
      
      if (deleted) {
        console.log(`[handleDeleteDiagram] Successfully deleted diagram: ${diagramId}`);
        
        // Update local state to remove the deleted diagram
        setDiagramHistory(prev => prev.filter(diagram => diagram.id !== diagramId));
        
        // Show success message
        alert(`"${displayName}" has been deleted.`);
      } else {
        console.error(`[handleDeleteDiagram] Failed to delete diagram: ${diagramId}`);
        alert("Failed to delete the diagram. Please try again.");
      }
    } catch (error) {
      console.error('[handleDeleteDiagram] Error:', error);
      alert("An error occurred while deleting the diagram.");
    }
  };

  // Add handlers for deleting ideation and planner entries
  const handleDeleteIdeation = async (ideationId: string, ideationName: string | undefined) => {
    const displayName = ideationName || "Unnamed Ideation";
    console.log(`[handleDeleteIdeation] Attempting to delete ideation: ${ideationId} - ${displayName}`);
    
    // Confirm before deleting
    if (!confirm(`Are you sure you want to delete "${displayName}"? This action cannot be undone.`)) {
      console.log(`[handleDeleteIdeation] Delete cancelled by user`);
      return;
    }
    
    try {
      // Call the server action to delete the ideation
      const deleted = await deleteIdeationById(ideationId);
      
      if (deleted) {
        console.log(`[handleDeleteIdeation] Successfully deleted ideation: ${ideationId}`);
        
        // Update local state to remove the deleted ideation
        setIdeationHistory(prev => prev.filter(ideation => ideation.id !== ideationId));
        
        // Show success message
        alert(`"${displayName}" has been deleted.`);
      } else {
        console.error(`[handleDeleteIdeation] Failed to delete ideation: ${ideationId}`);
        alert("Failed to delete the ideation. Please try again.");
      }
    } catch (error) {
      console.error('[handleDeleteIdeation] Error:', error);
      alert("An error occurred while deleting the ideation.");
    }
  };
  
  const handleDeletePlanner = async (plannerId: string, plannerName: string | undefined) => {
    const displayName = plannerName || "Unnamed Plan";
    console.log(`[handleDeletePlanner] Attempting to delete planner: ${plannerId} - ${displayName}`);
    
    // Confirm before deleting
    if (!confirm(`Are you sure you want to delete "${displayName}"? This action cannot be undone.`)) {
      console.log(`[handleDeletePlanner] Delete cancelled by user`);
      return;
    }
    
    try {
      // Call the server action to delete the planner
      const deleted = await deletePlannerById(plannerId);
      
      if (deleted) {
        console.log(`[handleDeletePlanner] Successfully deleted planner: ${plannerId}`);
        
        // Update local state to remove the deleted planner
        setPlannerHistory(prev => prev.filter(planner => planner.id !== plannerId));
        
        // Show success message
        alert(`"${displayName}" has been deleted.`);
      } else {
        console.error(`[handleDeletePlanner] Failed to delete planner: ${plannerId}`);
        alert("Failed to delete the plan. Please try again.");
      }
    } catch (error) {
      console.error('[handleDeletePlanner] Error:', error);
      alert("An error occurred while deleting the plan.");
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

  if (isDiagramFullScreen) {
    return (
      <div className="h-screen w-screen">
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
          isFullScreen={true}
          onToggleFullScreen={toggleDiagramFullScreen}
          onUpdate={handleFullscreenUpdate} 
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-4 pb-10 max-w-6xl">
      {project && (
        <ProjectNavbar 
          project={{
            id: project.id,
            name: project.name,
            grade: project.grade,
            domain: project.domain
          }}
          backUrl={`/project-helper?projectId=${project.id}`}
        />
      )}
      
      {!project && (
        <ProjectNavbar 
          backUrl="/project-helper"
        />
      )}
      
      <div className="mt-8 mb-8">
        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange}
          className="space-y-8"
        >
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="ideation">Project Ideation</TabsTrigger>
            <TabsTrigger value="planner">Project Planner</TabsTrigger>
            <TabsTrigger value="resources">Resource Suggestions</TabsTrigger>
            <TabsTrigger value="diagram">Diagram Builder</TabsTrigger>
            <TabsTrigger value="assistant">Project Assistant</TabsTrigger>
          </TabsList>

          <TabsContent value="ideation" className="">
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
                    <div className="mb-4">
                      <h3 className="text-base font-medium mb-2">Previous Ideations</h3>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse border border-gray-200 rounded-md">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Name</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Subject</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Last Modified</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {ideationHistory.map(ideation => (
                              <tr 
                                key={ideation.id}
                                className="hover:bg-gray-50 cursor-pointer"
                              >
                                <td 
                                  className="px-4 py-3"
                                  onClick={() => handleLoadIdeation(ideation.id)}
                                >
                                  <div className="font-medium text-sm">{ideation.name || "Unnamed Ideation"}</div>
                                  <div className="text-xs text-gray-500 truncate">{ideation.preview || ""}</div>
                                </td>
                                <td 
                                  className="px-4 py-3 text-sm"
                                  onClick={() => handleLoadIdeation(ideation.id)}
                                >
                                  {ideation.subject || "General"}
                                </td>
                                <td 
                                  className="px-4 py-3 text-sm text-gray-500"
                                  onClick={() => handleLoadIdeation(ideation.id)}
                                >
                                  {new Date(ideation.lastModified).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <button
                                    className="text-gray-400 hover:text-red-500"
                                    onClick={() => handleDeleteIdeation(ideation.id, ideation.name)}
                                    aria-label={`Delete ${ideation.name || "Unnamed Ideation"}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {loadingIdeationHistory ? (
                    <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                      <div className="animate-pulse flex space-x-4">
                        <div className="flex-1 space-y-3 py-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </div>
                      <div className="text-center mt-2 text-sm text-gray-500">Loading ideation history...</div>
                    </div>
                  ) : ideationHistory.length === 0 && (
                    <div className="border border-gray-200 rounded-md p-4 text-center">
                      <table className="min-w-full border-collapse border border-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Name</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Subject</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Last Modified</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                              No ideation history found. Start a new ideation process to see records here.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <p className="mb-2">Enter details about your project idea to get suggestions.</p>
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
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Project Ideation</CardTitle>
                    <CardDescription>
                      Refine details for your project
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setIdeationStarted(false)}>
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back to Ideations
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <ProjectIdeation 
                    onProjectDataGenerated={handleProjectDataGenerated}
                    projectId={projectId}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="planner" className="">
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
                    <div className="mb-4">
                      <h3 className="text-base font-medium mb-2">Previous Plans</h3>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse border border-gray-200 rounded-md">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Name</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Project Name</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Last Modified</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {plannerHistory.map(planner => (
                              <tr 
                                key={planner.id}
                                className="hover:bg-gray-50 cursor-pointer"
                              >
                                <td 
                                  className="px-4 py-3"
                                  onClick={() => handleLoadPlanner(planner.id)}
                                >
                                  <div className="font-medium text-sm">{planner.name || "Unnamed Plan"}</div>
                                  <div className="text-xs text-gray-500 truncate">{planner.preview || ""}</div>
                                </td>
                                <td 
                                  className="px-4 py-3 text-sm"
                                  onClick={() => handleLoadPlanner(planner.id)}
                                >
                                  {planner.projectName || "General"}
                                </td>
                                <td 
                                  className="px-4 py-3 text-sm text-gray-500"
                                  onClick={() => handleLoadPlanner(planner.id)}
                                >
                                  {new Date(planner.lastModified).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <button
                                    className="text-gray-400 hover:text-red-500"
                                    onClick={() => handleDeletePlanner(planner.id, planner.name)}
                                    aria-label={`Delete ${planner.name || "Unnamed Plan"}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {loadingPlannerHistory ? (
                    <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                      <div className="animate-pulse flex space-x-4">
                        <div className="flex-1 space-y-3 py-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </div>
                      <div className="text-center mt-2 text-sm text-gray-500">Loading plan history...</div>
                    </div>
                  ) : plannerHistory.length === 0 && (
                    <div className="border border-gray-200 rounded-md p-4 text-center">
                      <table className="min-w-full border-collapse border border-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Name</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Project Name</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Last Modified</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                              No planning history found. Start your first project plan.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <p className="mb-2">Create detailed plans for your project with guidance.</p>
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
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Project Planner</CardTitle>
                    <CardDescription>
                      Plan your project workflow and timeline
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setPlannerStarted(false)}>
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back to Plans
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <ProjectPlanner 
                    projectData={projectData} 
                    onResourceGeneration={handleResourceGeneration}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="resources" className="">
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
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Resource Suggestions</CardTitle>
                    <CardDescription>
                      Find resources relevant to your project
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setResourcesStarted(false)}>
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back to Resources
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <ResourceSuggestions 
                    resourceData={resourceData || {
                      projectName: project.name,
                      projectDescription: project.description,
                      grade: project.grade,
                      projectDomain: project.domain
                    }} 
                    onProjectAssistant={handleProjectAssistant} 
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="diagram" className="mt-0">
            {!diagramStarted ? (
              <Card>
                {/* Debug log for history length */}
                {(() => {
                  console.log('[UI Render] Rendering Diagram History Section. History Length:', diagramHistory.length);
                  return null; // Render nothing
                })()}
                {/* Previous Diagrams Section */}
                {diagramHistory.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-base font-medium mb-4">Previous Diagrams</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {diagramHistory.map(diagram => (
                        <div 
                          key={diagram.id}
                          className="border rounded-lg overflow-hidden hover:border-pink-300 transition-colors cursor-pointer relative"
                        >
                          {/* Delete Button - positioned absolute in top right */}
                          <button
                            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-red-50 z-10"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent triggering the parent div's onClick
                              handleDeleteDiagram(diagram.id, diagram.name);
                            }}
                            aria-label={`Delete ${diagram.name || "Unnamed Diagram"}`}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                          
                          <div
                            className="w-full" 
                            onClick={() => {
                              console.log(`[UI] Diagram card clicked: ID=${diagram.id}, Name=${diagram.name || "Unnamed Diagram"}`);
                              handleLoadDiagram(diagram.id);
                            }}
                          >
                            {/* Display a simple colored box instead of trying to load an image */}
                            <div className="h-32 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-center p-4">
                              <div className="text-indigo-700 font-medium">
                                {diagram.diagramType === 'flowchart' && '📊 Flowchart'}
                                {diagram.diagramType === 'businessCanvas' && '💼 Business Canvas'}
                                {diagram.diagramType === 'leanCanvas' && '📝 Lean Canvas'}
                                {diagram.diagramType === 'mindmap' && '🧠 Mind Map'}
                                {!['flowchart', 'businessCanvas', 'leanCanvas', 'mindmap'].includes(diagram.diagramType) && 
                                  `🔷 ${diagram.diagramType || 'Custom'} Diagram`}
                              </div>
                            </div>
                            <div className="p-3">
                              <div className="font-medium text-sm">{diagram.name || "Unnamed Diagram"}</div>
                              <div className="text-xs text-gray-500">Last modified: {new Date(diagram.lastModified).toLocaleDateString()}</div>
                            </div>
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
              </Card>
            ) : (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Project Diagram Builder</CardTitle>
                    <CardDescription>
                      Visualizing: {diagramData?.name || selectedDiagramTemplate || 'Custom Diagram'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={toggleDiagramFullScreen}>
                      <Maximize className="h-4 w-4 mr-1" />
                      Fullscreen
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDiagramStarted(false)}>
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back to Diagrams
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0 h-[800px]">
                  <div className="h-full w-full">
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
                      isFullScreen={false}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="assistant" className="">
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
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            className="bg-pink-600 hover:bg-pink-700 text-white"
                            onClick={handleStartAssistant}
                          >
                            Chat with Assistant
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>New: The assistant now visually maps relationships between your code components!</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
        </Tabs>
      </div>
    </div>
  );
}