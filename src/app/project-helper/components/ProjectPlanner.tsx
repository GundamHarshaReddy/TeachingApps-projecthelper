"use client";

import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent } from "../components/ui/card";
import { ScrollArea } from "../components/ui/scroll-area";
import { generateProjectPlan, modifyProjectPlan } from "../actions/ai";
import { saveText } from "../actions/database";
import { savePlanner, getPlannerById } from "../actions/planners";
import ReactMarkdown from "react-markdown";
import PdfDownloadButton from "./PdfDownloadButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Alert, AlertDescription } from "../components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { ProjectPlannerProps, ProjectData, ResourceData } from "../types";
import { useSearchParams } from "next/navigation";

function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) {
    return "st";
  }
  if (j === 2 && k !== 12) {
    return "nd";
  }
  if (j === 3 && k !== 13) {
    return "rd";
  }
  return "th";
}

type Message = {
  role: "user" | "assistant";
  content: string;
};

// SaveDialog component for naming planners
interface SaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
  initialName?: string;
  projectName?: string;
}

const SaveDialog = ({ isOpen, onClose, onSave, initialName = "", projectName = "" }: SaveDialogProps) => {
  const [name, setName] = useState(initialName || "");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (isOpen && !name) {
      setName(`${projectName || 'Project'} Plan - ${new Date().toLocaleDateString()}`);
    }
  }, [isOpen, name, projectName]);

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'}`}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">Save Project Plan</h3>
        <p className="text-sm text-gray-500 mb-4">
          Give your project plan a name to help identify it later.
        </p>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="plan-name">Name</Label>
            <Input
              id="plan-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div>
            <Label htmlFor="plan-desc">Notes (optional)</Label>
            <Textarea
              id="plan-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full"
              placeholder="Add any additional notes about this plan"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(name, description)}>
            Save Plan
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function ProjectPlanner({
  projectData,
  onResourceGeneration,
}: ProjectPlannerProps) {
  const searchParams = useSearchParams();
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [projectTimeline, setProjectTimeline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [grade, setGrade] = useState("");
  const [projectDomain, setProjectDomain] = useState("technical");
  const [saveError, setSaveError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedProjectTimeline, setEditedProjectTimeline] = useState("");
  // Add new state for save dialog
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [savedPlannerId, setSavedPlannerId] = useState<string | undefined>();
  const [savedPlannerName, setSavedPlannerName] = useState<string>("");

  useEffect(() => {
    async function loadPlannerFromId() {
      const plannerId = searchParams.get("plannerId");
      if (plannerId) {
        try {
          setLoading(true);
          const plannerData = await getPlannerById(plannerId);
          if (plannerData) {
            // Load planner data into the form
            setProjectName(plannerData.projectName || "");
            setProjectDescription(plannerData.projectDescription || "");
            setDuration(plannerData.duration || "");
            setGrade(plannerData.grade || "");
            setProjectDomain(plannerData.projectDomain || "technical");
            setProjectTimeline(plannerData.projectTimeline || "");
            setSavedPlannerId(plannerData.id);
            setSavedPlannerName(plannerData.name || "");
            
            if (plannerData.projectTimeline) {
              setMessages([{ role: "assistant", content: plannerData.projectTimeline }]);
            }
          }
        } catch (error) {
          console.error("Error loading planner:", error);
          setError("Failed to load the saved plan. Starting with project data.");
        } finally {
          setLoading(false);
        }
      }
    }
    
    // If no planner ID in URL, but we have project data, use that
    if (!searchParams.get("plannerId") && projectData) {
      setProjectName(projectData.projectName);
      setProjectDescription(projectData.projectDescription);
      setDuration(projectData.duration);
      setGrade(projectData.grade);
      setProjectDomain(projectData.projectDomain);
      handleGenerateTimeline(
        projectData.projectDescription,
        projectData.duration,
        projectData.grade,
        projectData.projectDomain
      );
    } else {
      loadPlannerFromId();
    }
  }, [searchParams, projectData]);

  const handleGenerateTimeline = async (
    idea: string,
    duration: string,
    grade: string,
    domain: string
  ) => {
    try {
      setLoading(true);
      setError("");
      const generatedTimeline = await generateProjectPlan(
        idea,
        duration,
        grade,
        domain
      );
      setProjectTimeline(generatedTimeline);
      setMessages([{ role: "assistant", content: generatedTimeline }]);
    } catch (error) {
      console.error("Error generating timeline:", error);
      if (
        error instanceof Error &&
        (error.message.includes("504") || error.message.includes("timeout"))
      ) {
        setError(
          "The server is taking too long to respond. Please try again with a simpler project description or retry in a few minutes."
        );
      } else {
        setError(
          "An error occurred while generating the timeline. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManualGenerateTimeline = async () => {
    if (!projectDescription || !duration || !grade || !projectDomain) {
      setError("Please ensure all fields are filled.");
      return;
    }
    await handleGenerateTimeline(
      projectDescription,
      duration,
      grade,
      projectDomain
    );
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const modifiedPlan = await modifyProjectPlan(
        projectTimeline,
        input,
        projectDomain
      );
      setProjectTimeline(modifiedPlan);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: modifiedPlan },
      ]);
    } catch (error) {
      console.error("Error modifying project plan:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I apologize, but I encountered an error. Could you please try again?",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateResources = () => {
    onResourceGeneration({
      projectName,
      projectDescription,
      duration: `${duration} days`,
      grade,
      projectDomain,
      projectTimeline
    });
  };

  const handleSaveTimeline = async () => {
    if (!projectTimeline) {
      setSaveError("No project timeline to save.");
      return;
    }

    // Open the save dialog instead of saving directly
    setIsSaveDialogOpen(true);
  };

  // Add new function to handle saving with name
  const handleSaveWithName = async (name: string, description: string) => {
    setIsSaveDialogOpen(false);
    
    if (!projectTimeline) {
      setSaveError("No project timeline to save.");
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare data for saving
      const saveData = {
        id: savedPlannerId, // For updating existing planner
        name: name,
        project_name: projectName,
        project_description: projectDescription,
        duration: duration,
        grade: grade,
        project_domain: projectDomain,
        project_timeline: projectTimeline,
        projectId: projectData?.id
      };
      
      // Save to database using the new server action
      const result = await savePlanner(saveData);
      
      if (result.success) {
        setSavedPlannerId(result.id);
        setSavedPlannerName(result.name);
        setSaveError("");
        // Show success message
        alert(`Project plan saved as "${result.name}"`);
      } else {
        setSaveError(result.message || "Failed to save the project plan.");
      }
    } catch (error) {
      console.error("Error saving planner:", error);
      setSaveError(
        error instanceof Error
          ? error.message
          : "Failed to save the project plan. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setProjectTimeline(editedProjectTimeline);
    } else {
      setEditedProjectTimeline(projectTimeline);
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="projectName">Project Name</Label>
          <Input
            id="projectName"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Enter your project name"
          />
        </div>
        <div>
          <Label htmlFor="projectDomain">Project Domain</Label>
          <Select value={projectDomain} onValueChange={setProjectDomain}>
            <SelectTrigger id="projectDomain">
              <SelectValue placeholder="Select project domain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="non-technical">Non-Technical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="duration">Project Duration (in days)</Label>
          <Input
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Enter duration in days"
          />
        </div>
        <div>
          <Label htmlFor="grade">Grade Level</Label>
          <Select value={grade} onValueChange={setGrade}>
            <SelectTrigger id="grade">
              <SelectValue placeholder="Select grade level" />
            </SelectTrigger>
            <SelectContent>
              {[...Array(10)].map((_, i) => (
                <SelectItem key={i} value={`${i + 1}`}>
                  {`${i + 1}${getOrdinalSuffix(i + 1)} Grade`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="projectDescription">Project Description</Label>
        <Textarea
          id="projectDescription"
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
          placeholder="Describe your project"
          className="h-32"
        />
      </div>
      <Button
        onClick={handleManualGenerateTimeline}
        disabled={loading}
        className="w-full"
      >
        {loading ? "Generating..." : "Generate Timeline"}
      </Button>
      {loading && (
        <div className="text-center mt-4">Generating project timeline...</div>
      )}
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          <p>{error}</p>
        </div>
      )}
      {projectTimeline && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <h3 className="font-bold text-lg mb-2">
              Generated Project Timeline:
            </h3>
            <div className="prose prose-sm max-w-none dark:prose-invert dark:bg-gray-900">
              {isEditing ? (
                <Textarea
                  value={editedProjectTimeline}
                  onChange={(e) => setEditedProjectTimeline(e.target.value)}
                  className="w-full h-64 p-2 border rounded"
                />
              ) : (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown
                    components={{
                    h1: ({ node, ...props }) => (
                      <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 className="text-2xl font-bold mt-4 mb-3" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 className="text-xl font-bold mt-3 mb-2" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul
                        className="list-disc pl-6 mb-4 space-y-2"
                        {...props}
                      />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol
                        className="list-decimal pl-6 mb-4 space-y-2"
                        {...props}
                      />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="mb-1" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="mb-4" {...props} />
                    ),
                    code: ({ node, ...props }) => (
                      <code
                        className="bg-muted px-[0.3rem] py-[0.2rem] rounded text-sm"
                        {...props}
                      />
                    ),
                    pre: ({ node, ...props }) => (
                      <pre
                        className="bg-muted p-4 rounded-lg overflow-x-auto"
                        {...props}
                      />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong className="font-semibold" {...props} />
                    ),
                    em: ({ node, ...props }) => (
                      <em className="italic" {...props} />
                    ),
                  }}
                >
                  {projectTimeline}
                  </ReactMarkdown>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center mt-4 space-x-2">
              <Button
                onClick={handleGenerateResources}
                disabled={!projectTimeline || loading}
              >
                Generate Resources
              </Button>
              <Button
                onClick={handleSaveTimeline}
                disabled={!projectTimeline || loading}
              >
                {loading ? "Saving..." : "Save Timeline"}
              </Button>
              <Button onClick={handleEditToggle}>
                {isEditing ? "Save Changes" : "Edit"}
              </Button>
              <PdfDownloadButton
                projectName={projectName}
                content={[
                  { title: "Project Description", text: projectDescription },
                  { title: "Project Timeline", text: projectTimeline },
                ]}
              />
            </div>
          </CardContent>
        </Card>
      )}
      {saveError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}
      {projectTimeline && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <h3 className="font-bold text-lg mb-2">Modify Your Plan:</h3>
            <ScrollArea className="h-[300px] pr-4 mb-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 ${message.role === "user" ? "text-right" : "text-left"}`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown
                        components={{
                          h1: ({ node, ...props }) => (
                            <h1
                              className="text-3xl font-bold mt-6 mb-4"
                              {...props}
                            />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2
                              className="text-2xl font-bold mt-4 mb-3"
                              {...props}
                            />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3
                              className="text-xl font-bold mt-3 mb-2"
                              {...props}
                            />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul
                              className="list-disc pl-6 mb-4 space-y-2"
                              {...props}
                            />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol
                              className="list-decimal pl-6 mb-4 space-y-2"
                              {...props}
                            />
                          ),
                          li: ({ node, ...props }) => (
                            <li className="mb-1" {...props} />
                          ),
                          p: ({ node, ...props }) => (
                            <p className="mb-4" {...props} />
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
            <div className="flex space-x-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Suggest modifications to your project plan..."
                className="flex-grow"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button onClick={handleSendMessage} disabled={loading}>
                {loading ? "Sending..." : "Send"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Add the SaveDialog component */}
      <SaveDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        onSave={handleSaveWithName}
        initialName={savedPlannerName}
        projectName={projectName}
      />
    </div>
  );
}
