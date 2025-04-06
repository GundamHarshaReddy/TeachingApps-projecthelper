"use client";

import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent } from "../components/ui/card";
import { generateResources } from "../actions/ai";
import { saveText } from "../actions/database";
import PdfDownloadButton from "./PdfDownloadButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Alert, AlertDescription } from "../components/ui/alert";
import { AlertCircle, ChevronLeftIcon } from "lucide-react";
import type { Resource, ResourceData, ProjectAssistantData } from "../types";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

// Define storage keys
const STORAGE_KEYS = {
  topic: "resources_topic",
  specificGoals: "resources_specificGoals",
  timeAvailable: "resources_timeAvailable",
  grade: "resources_grade",
  projectDomain: "resources_projectDomain",
  resources: "resources_list",
};

// Helper function to load state from sessionStorage
const loadFromStorage = (key: string, defaultValue: any) => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from sessionStorage:`, error);
    return defaultValue;
  }
};

// Helper function to save state to sessionStorage
const saveToStorage = (key: string, value: any) => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to sessionStorage:`, error);
  }
};

interface ResourceSuggestionsProps {
  resourceData?: ResourceData;
  onProjectAssistant: (data: ProjectAssistantData) => void;
}

export default function ResourceSuggestions({
  resourceData,
  onProjectAssistant,
}: ResourceSuggestionsProps) {
  const router = useRouter();
  
  // Initialize state from sessionStorage with fallback to props
  const [topic, setTopic] = useState(() => loadFromStorage(STORAGE_KEYS.topic, resourceData?.projectName || ""));
  const [specificGoals, setSpecificGoals] = useState(() => loadFromStorage(STORAGE_KEYS.specificGoals, resourceData?.projectDescription || ""));
  const [timeAvailable, setTimeAvailable] = useState(() => loadFromStorage(STORAGE_KEYS.timeAvailable, resourceData?.duration || ""));
  const [resources, setResources] = useState<Resource[]>(() => loadFromStorage(STORAGE_KEYS.resources, []));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [grade, setGrade] = useState(() => loadFromStorage(STORAGE_KEYS.grade, resourceData?.grade || ""));
  const [projectDomain, setProjectDomain] = useState(() => loadFromStorage(STORAGE_KEYS.projectDomain, resourceData?.projectDomain || "technical"));
  const [saveError, setSaveError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedResources, setEditedResources] = useState("");
  
  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.topic, topic);
    saveToStorage(STORAGE_KEYS.specificGoals, specificGoals);
    saveToStorage(STORAGE_KEYS.timeAvailable, timeAvailable);
    saveToStorage(STORAGE_KEYS.grade, grade);
    saveToStorage(STORAGE_KEYS.projectDomain, projectDomain);
    saveToStorage(STORAGE_KEYS.resources, resources);
  }, [topic, specificGoals, timeAvailable, grade, projectDomain, resources]);

  // Add effect to handle page visibility change (user returning via back button)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // User has returned to this page - no need to reload data as it's already in state
        // and we're using sessionStorage which persists during the session
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Load data from resourceData once if provided
  useEffect(() => {
    if (resourceData && !loadFromStorage(STORAGE_KEYS.topic, "")) {
      // Only load from props if sessionStorage is empty (first load)
      setTopic(resourceData.projectName || "");
      setSpecificGoals(resourceData.projectDescription || "");
      setTimeAvailable(resourceData.duration || "");
      setGrade(resourceData.grade || "");
      setProjectDomain(resourceData.projectDomain || "technical");
      
      // Save to storage immediately
      saveToStorage(STORAGE_KEYS.topic, resourceData.projectName || "");
      saveToStorage(STORAGE_KEYS.specificGoals, resourceData.projectDescription || "");
      saveToStorage(STORAGE_KEYS.timeAvailable, resourceData.duration || "");
      saveToStorage(STORAGE_KEYS.grade, resourceData.grade || "");
      saveToStorage(STORAGE_KEYS.projectDomain, resourceData.projectDomain || "technical");
    }
  }, [resourceData]); // Only depend on resourceData prop

  const validateInputs = () => {
    return Boolean(
      topic.trim() &&
        specificGoals.trim() &&
        timeAvailable.trim() &&
        grade &&
        projectDomain
    );
  };

  const handleGenerateResources = async (
    topicValue: string,
    goalsValue: string,
    timeValue: string,
    gradeValue: string,
    domainValue: string
  ) => {
    if (!validateInputs()) {
      setError("Please ensure all fields are filled.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResources([]);

      const generatedResources = await generateResources(
        goalsValue,
        domainValue,
        gradeValue,
        timeValue
      );

      if (
        !Array.isArray(generatedResources) ||
        generatedResources.length === 0
      ) {
        throw new Error(
          "No resources were generated. Please try adjusting your search parameters."
        );
      }

      setResources(generatedResources);
    } catch (error) {
      console.error("Error generating resources:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while generating resources. Please try again."
      );
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectAssistant = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log('ResourceSuggestions: Continuing to Diagram Builder with:', {
        projectName: topic,
        projectDescription: specificGoals,
        grade,
        projectDomain,
      });

      // Send resource data to diagram builder
      onProjectAssistant({
        topic,
        specificGoals,
        timeAvailable,
        grade,
        projectDomain,
        resources,
      });
    } catch (error) {
      console.error("Error navigating to diagram builder:", error);
      setError(
        `Failed to navigate to diagram builder. Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResources = async () => {
    if (resources.length === 0) {
      setSaveError("No resources to save.");
      return;
    }

    try {
      setLoading(true);
      const contentToSave = `# ${topic} - Learning Resources\n\n${resources
        .map(
          (resource) =>
            `## [${resource.title}](${resource.url})\n${resource.description}`
        )
        .join("\n\n")}`;
      const savedText = await saveText(contentToSave);
      setSaveError("");
      alert(`Resources saved successfully! ID: ${savedText.id}`);
    } catch (error) {
      console.error("Error saving resources:", error);
      setSaveError(
        error instanceof Error
          ? error.message
          : "Failed to save the resources. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      try {
        const parsedResources = JSON.parse(editedResources);
        setResources(parsedResources);
      } catch (error) {
        console.error("Error parsing edited resources:", error);
        alert(
          "There was an error saving your changes. Please check the format and try again."
        );
      }
    } else {
      setEditedResources(JSON.stringify(resources, null, 2));
    }
    setIsEditing(!isEditing);
  };

  return (
    <div>
      {/* Removed back button */}

      <h2 className="text-2xl font-bold mb-4">Resource Suggestions</h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic for resource suggestions"
              required
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
            <Label htmlFor="timeAvailable">Time Available for Learning</Label>
            <Input
              id="timeAvailable"
              value={timeAvailable}
              onChange={(e) => setTimeAvailable(e.target.value)}
              placeholder="e.g., 1 day, 1 week"
              required
            />
          </div>
          <div>
            <Label htmlFor="grade">Grade Level</Label>
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger id="grade">
                <SelectValue placeholder="Select grade level" />
              </SelectTrigger>
              <SelectContent>
                {[...Array(12)].map((_, i) => (
                  <SelectItem key={i} value={`${i + 1}`}>
                    {`${i + 1}${getOrdinalSuffix(i + 1)} Grade`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="specificGoals">Specific Learning Goals</Label>
          <Textarea
            id="specificGoals"
            value={specificGoals}
            onChange={(e) => setSpecificGoals(e.target.value)}
            placeholder="Describe what you want to learn or achieve"
            className="h-24"
            required
          />
        </div>
        <Button
          onClick={() =>
            handleGenerateResources(
              topic,
              specificGoals,
              timeAvailable,
              grade,
              projectDomain
            )
          }
          disabled={loading}
          className="w-full"
        >
          {loading ? "Generating Resources..." : "Get Resource Suggestions"}
        </Button>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {resources.length > 0 && (
          <Card className="mt-6">
            <CardContent className="p-4">
              <h3 className="font-bold text-lg mb-4">Suggested Resources:</h3>
              {isEditing ? (
                <Textarea
                  value={editedResources}
                  onChange={(e) => setEditedResources(e.target.value)}
                  className="w-full h-64 p-2 border rounded font-mono text-sm"
                />
              ) : (
                <ul className="space-y-6">
                  {resources.map((resource, index) => (
                    <li key={index} className="border-b pb-4 last:border-b-0">
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {resource.title}
                      </a>
                      <p className="mt-2 text-gray-600 dark:text-gray-300">
                        {resource.description}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex justify-between items-center mt-6 space-x-2">
                <Button
                  onClick={handleProjectAssistant}
                  disabled={loading || resources.length === 0}
                  className="bg-pink-600 hover:bg-pink-700 text-white"
                >
                  {loading ? "Loading..." : "Continue to Diagram Builder"}
                </Button>
                <Button
                  onClick={handleSaveResources}
                  disabled={resources.length === 0 || loading}
                >
                  {loading ? "Saving..." : "Save Resources"}
                </Button>
                <Button onClick={handleEditToggle}>
                  {isEditing ? "Save Changes" : "Edit"}
                </Button>
                <PdfDownloadButton
                  projectName={topic}
                  content={[
                    { title: "Learning Goals", text: specificGoals },
                    {
                      title: "Resources",
                      text: resources
                        .map(
                          (resource) =>
                            `## [${resource.title}](${resource.url})\n${resource.description}`
                        )
                        .join("\n\n"),
                    },
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
      </div>
    </div>
  );
}