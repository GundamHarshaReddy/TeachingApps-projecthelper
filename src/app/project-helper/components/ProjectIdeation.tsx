"use client";

import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Card, CardContent } from "../components/ui/card";
import { ScrollArea } from "../components/ui/scroll-area";
import { generateProjectIdea, modifyProjectIdea } from "../actions/ai";
import { saveText } from "../actions/database";
import { saveIdeation } from "../actions/ideation";
import ReactMarkdown from "react-markdown";
import PdfDownloadButton from "./PdfDownloadButton";
import { Alert, AlertDescription } from "../components/ui/alert";
import { AlertCircle, ChevronLeftIcon } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { getIdeationById } from "../actions/ideation";
import Link from "next/link";

// Local storage keys
const STORAGE_KEYS = {
  subject: "ideation_subject",
  interests: "ideation_interests",
  tools: "ideation_tools",
  skillLevel: "ideation_skillLevel",
  projectDuration: "ideation_projectDuration",
  targetAudience: "ideation_targetAudience",
  grade: "ideation_grade",
  detailedExplanation: "ideation_detailedExplanation",
  projectIdea: "ideation_projectIdea",
  projectDomain: "ideation_projectDomain",
  messages: "ideation_messages",
};

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

interface SaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
  initialName?: string;
}

const SaveDialog = ({ isOpen, onClose, onSave, initialName = "" }: SaveDialogProps) => {
  const [name, setName] = useState(initialName || "");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (isOpen && !name) {
      setName(`Project Ideation - ${new Date().toLocaleDateString()}`);
    }
  }, [isOpen, name]);

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'}`}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">Save Project Ideation</h3>
        <p className="text-sm text-gray-500 mb-4">
          Give your ideation a name to help identify it later.
        </p>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="ideation-name">Name</Label>
            <Input
              id="ideation-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div>
            <Label htmlFor="ideation-desc">Notes (optional)</Label>
            <Textarea
              id="ideation-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full"
              placeholder="Add any additional notes about this ideation"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(name, description)}>
            Save Ideation
          </Button>
        </div>
      </div>
    </div>
  );
};

interface ProjectIdeationProps {
  onProjectDataGenerated: (data: {
    projectName: string;
    projectDescription: string;
    duration: string;
    grade: string;
    detailedExplanation: string;
    projectDomain: string;
    id?: string;
  }) => void;
  projectId?: string | null;
}

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

export default function ProjectIdeation({
  onProjectDataGenerated,
  projectId
}: ProjectIdeationProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [subject, setSubject] = useState(() => loadFromStorage(STORAGE_KEYS.subject, ""));
  const [interests, setInterests] = useState(() => loadFromStorage(STORAGE_KEYS.interests, ""));
  const [tools, setTools] = useState(() => loadFromStorage(STORAGE_KEYS.tools, ""));
  const [skillLevel, setSkillLevel] = useState(() => loadFromStorage(STORAGE_KEYS.skillLevel, "intermediate"));
  const [projectDuration, setProjectDuration] = useState(() => loadFromStorage(STORAGE_KEYS.projectDuration, "30-60"));
  const [targetAudience, setTargetAudience] = useState(() => loadFromStorage(STORAGE_KEYS.targetAudience, ""));
  const [grade, setGrade] = useState(() => loadFromStorage(STORAGE_KEYS.grade, ""));
  const [detailedExplanation, setDetailedExplanation] = useState(() => loadFromStorage(STORAGE_KEYS.detailedExplanation, ""));
  const [projectIdea, setProjectIdea] = useState(() => loadFromStorage(STORAGE_KEYS.projectIdea, ""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => loadFromStorage(STORAGE_KEYS.messages, []));
  const [input, setInput] = useState("");
  const [projectDomain, setProjectDomain] = useState(() => loadFromStorage(STORAGE_KEYS.projectDomain, "technical"));
  const [saveError, setSaveError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedProjectIdea, setEditedProjectIdea] = useState("");
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [savedIdeationId, setSavedIdeationId] = useState<string | undefined>();
  const [savedIdeationName, setSavedIdeationName] = useState<string>("");
  const [isViewingSavedHistory, setIsViewingSavedHistory] = useState(false);
  const [projectDataFetched, setProjectDataFetched] = useState(false);
  
  // State for initially fetched data (for display only)
  const [fetchedSubject, setFetchedSubject] = useState("");
  const [fetchedGrade, setFetchedGrade] = useState("");
  const [fetchedProjectDomain, setFetchedProjectDomain] = useState("");
  const [fetchedProjectDuration, setFetchedProjectDuration] = useState("");
  const [fetchedDetailedExplanation, setFetchedDetailedExplanation] = useState("");
  
  // Track which fields were pre-filled from project data
  const [prefilled, setPrefilled] = useState<{[key: string]: boolean}>({
    subject: false,
    projectDomain: false,
    grade: false,
    detailedExplanation: false,
    interests: false,
    tools: false,
    skillLevel: false,
    projectDuration: false,
    targetAudience: false
  });

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    if (!isViewingSavedHistory) {
      saveToStorage(STORAGE_KEYS.subject, subject);
      saveToStorage(STORAGE_KEYS.interests, interests);
      saveToStorage(STORAGE_KEYS.tools, tools);
      saveToStorage(STORAGE_KEYS.skillLevel, skillLevel);
      saveToStorage(STORAGE_KEYS.projectDuration, projectDuration);
      saveToStorage(STORAGE_KEYS.targetAudience, targetAudience);
      saveToStorage(STORAGE_KEYS.grade, grade);
      saveToStorage(STORAGE_KEYS.detailedExplanation, detailedExplanation);
      saveToStorage(STORAGE_KEYS.projectIdea, projectIdea);
      saveToStorage(STORAGE_KEYS.projectDomain, projectDomain);
      saveToStorage(STORAGE_KEYS.messages, messages);
    }
  }, [
    subject, interests, tools, skillLevel, projectDuration, 
    targetAudience, grade, detailedExplanation, projectIdea, 
    projectDomain, messages, isViewingSavedHistory
  ]);

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

  // Effect to fetch project data and pre-populate form fields
  useEffect(() => {
    async function fetchProjectData() {
      if (!projectId || projectDataFetched) return;
      
      try {
        setLoading(true);
        const { getProjectById } = await import("../actions/projects");
        const projectData = await getProjectById(projectId);
        
        if (projectData) {
          // Set fetched data for display (only fields from CreateProject)
          const initialSubject = projectData.subject || projectData.projectName || "";
          const initialDomain = projectData.domain || "other"; // Use domain directly
          const initialGrade = projectData.grade || "";
          const initialInterests = projectData.interests || "";
          const initialTools = projectData.toolsOrSkills || "";
          const initialSkillLevel = projectData.skillLevel || "intermediate";
          const initialTargetAudience = projectData.targetAudience || "";
          // Note: Duration and Description are NOT fetched from projectData anymore

          setFetchedSubject(initialSubject);
          setFetchedProjectDomain(initialDomain);
          setFetchedGrade(initialGrade);
          // Do NOT set fetchedDuration or fetchedDetailedExplanation
          setFetchedProjectDuration(""); // Ensure display state is cleared
          setFetchedDetailedExplanation(""); // Ensure display state is cleared

          // Always set editable state from fetched data, overwriting sessionStorage if needed
          const newPrefilled = { ...prefilled }; // Start with existing flags

          setSubject(initialSubject);
          newPrefilled.subject = !!initialSubject; // Mark prefilled if fetched subject exists
          
          setProjectDomain(initialDomain);
          newPrefilled.projectDomain = !!initialDomain; // Mark prefilled if fetched domain exists

          setGrade(initialGrade);
          newPrefilled.grade = !!initialGrade; // Mark prefilled if fetched grade exists

          setInterests(initialInterests);
          newPrefilled.interests = !!initialInterests; // Mark prefilled if fetched interests exist
          
          setTools(initialTools); // Always update from fetched data
          newPrefilled.tools = !!initialTools; // Mark prefilled accurately based on fetched data
          
          setSkillLevel(initialSkillLevel);
          newPrefilled.skillLevel = !!initialSkillLevel; // Mark prefilled if fetched skill level exists

          setTargetAudience(initialTargetAudience);
          newPrefilled.targetAudience = !!initialTargetAudience; // Mark prefilled if fetched audience exists

          // Duration and Explanation are intentionally NOT set from projectData here
          // Ensure their prefilled flags remain false
          newPrefilled.projectDuration = false;
          newPrefilled.detailedExplanation = false;

          // Explicitly clear state for fields not provided by CreateProject 
          // to remove any stale sessionStorage values.
          setProjectDuration("30-60"); // Reset to default
          setDetailedExplanation(""); // Clear explanation
          // Clear corresponding sessionStorage too prevent re-load on refresh before fetch
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem(STORAGE_KEYS.projectDuration);
            sessionStorage.removeItem(STORAGE_KEYS.detailedExplanation);
          }
          
          setPrefilled(newPrefilled);
          setProjectDataFetched(true);
        }
      } catch (error) {
        console.error("Error fetching project data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProjectData();
  }, [projectId, projectDataFetched]);

  useEffect(() => {
    async function loadIdeationFromId() {
      const ideationId = searchParams.get("ideationId");
      if (ideationId) {
        try {
          setLoading(true);
          const ideationData = await getIdeationById(ideationId);
          if (ideationData) {
            setSubject(ideationData.subject || "");
            setInterests(ideationData.interests || "");
            setTools(ideationData.tools || "");
            setSkillLevel(ideationData.skillLevel || "intermediate");
            setProjectDuration(ideationData.projectDuration || "30-60");
            setTargetAudience(ideationData.targetAudience || "");
            setGrade(ideationData.grade || "");
            setDetailedExplanation(ideationData.detailedExplanation || "");
            setProjectIdea(ideationData.projectIdea || "");
            setProjectDomain(ideationData.projectDomain || "technical");
            setSavedIdeationId(ideationData.id);
            setSavedIdeationName(ideationData.name || "");
            setIsViewingSavedHistory(true);
            
            if (ideationData.projectIdea) {
              setMessages([{ role: "assistant", content: ideationData.projectIdea }]);
            }
          }
        } catch (error) {
          console.error("Error loading ideation:", error);
          setError("Failed to load the saved ideation. Starting with a blank form.");
        } finally {
          setLoading(false);
        }
      }
    }
    
    loadIdeationFromId();
  }, [searchParams]);

  const handleGenerateIdea = async () => {
    try {
      setLoading(true);
      setError("");
      const idea = await generateProjectIdea(
        projectDomain,
        subject,
        interests,
        tools, // tools or project type selected
        projectDomain === "technical" ? skillLevel : "", // conditionally pass skillLevel
        projectDuration,
        targetAudience,
        grade,
        detailedExplanation
      );
      setProjectIdea(idea);
      setMessages([{ role: "assistant", content: idea }]);
    } catch (error) {
      console.error("Error generating project idea:", error);
      setError("Failed to generate project idea. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const modifiedIdea = await modifyProjectIdea(projectIdea, input);
      setProjectIdea(modifiedIdea);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: modifiedIdea },
      ]);
    } catch (error) {
      console.error("Error modifying project idea:", error);
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

  const handleGeneratePlan = () => {
    if (projectIdea) {
      const projectName = projectIdea.split("\n")[0].replace(/^#\s*/, "");
      onProjectDataGenerated({
        projectName,
        projectDescription: projectIdea,
        duration: projectDuration,
        grade,
        detailedExplanation,
        projectDomain,
        id: savedIdeationId || undefined
      });
    }
  };

  const handleSaveText = async () => {
    if (!projectIdea) {
      setSaveError("No project idea to save.");
      return;
    }

    setIsSaveDialogOpen(true);
  };

  const handleSaveWithName = async (name: string, description: string) => {
    setIsSaveDialogOpen(false);
    
    if (!projectIdea) {
      setSaveError("No project idea to save.");
      return;
    }
    
    try {
      setLoading(true);
      
      const saveData = {
        id: savedIdeationId,
        name: name,
        subject: subject,
        interests: interests,
        tools: tools,
        skill_level: skillLevel,
        project_duration: projectDuration,
        target_audience: targetAudience,
        grade: grade,
        detailed_explanation: description || detailedExplanation,
        project_domain: projectDomain,
        project_idea: projectIdea,
        projectId: projectId
      };
      
      const result = await saveIdeation(saveData);
      
      if (result.success) {
        setSavedIdeationId(result.id);
        setSavedIdeationName(result.name || "");
        setSaveError("");
        const actionType = savedIdeationId ? 'updated' : 'saved as';
        alert(`Project ideation ${actionType} "${result.name || "Unnamed Ideation"}"`);
      } else {
        setSaveError(result.message || "Failed to save the project idea.");
      }
    } catch (error) {
      console.error("Error saving ideation:", error);
      setSaveError(
        error instanceof Error
          ? error.message
          : "Failed to save the project idea. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setProjectIdea(editedProjectIdea);
    } else {
      setEditedProjectIdea(projectIdea);
    }
    setIsEditing(!isEditing);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Refine Project Details for Ideation</h2>
      
      {!isViewingSavedHistory ? (
        <>
          {/* Editable fields section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg dark:border-gray-700">
            {/* Subject - Now editable */}
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Computer Science, Biology"
                className={prefilled.subject ? "bg-gray-100 dark:bg-gray-700" : ""}
              />
              {prefilled.subject && (
                <p className="text-xs text-gray-500 mt-1">Pre-filled (can be modified)</p>
              )}
            </div>
            {/* Project Domain - Now editable */}
             <div>
              <Label htmlFor="projectDomain">Project Domain</Label>
              <Select
                value={projectDomain}
                onValueChange={setProjectDomain}
              >
                <SelectTrigger
                  id="projectDomain"
                  className={prefilled.projectDomain ? "bg-gray-100 dark:bg-gray-700" : ""}
                >
                  <SelectValue placeholder="Select project domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="non-technical">Non-Technical</SelectItem>
                </SelectContent>
              </Select>
              {prefilled.projectDomain && (
                <p className="text-xs text-gray-500 mt-1">Pre-filled (can be modified)</p>
              )}
            </div>
            {/* Interests/Topic */}
            <div>
              <Label htmlFor="interests">
                {projectDomain === "technical" ? "Interests" : "Topic"}
              </Label>
              <Input
                id="interests"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder={
                  projectDomain === "technical"
                    ? "e.g., Machine Learning, Environmental Science"
                    : "e.g., History, Literature"
                }
                className={prefilled.interests ? "bg-gray-100 dark:bg-gray-700" : ""}
              />
              {prefilled.interests && (
                <p className="text-xs text-gray-500 mt-1">Pre-filled (can be modified)</p>
              )}
            </div>
            {/* Tools/Project Type */}
            <div>
              <Label htmlFor="tools">
                {projectDomain === "technical" ? "Tools Known" : "Project Type"}
              </Label>
              {projectDomain === "technical" ? (
                <Input
                  id="tools"
                  value={tools}
                  onChange={(e) => setTools(e.target.value)}
                  placeholder="e.g., Python, React"
                  className={prefilled.tools ? "bg-gray-100 dark:bg-gray-700" : ""}
                />
              ) : (
                <Select value={tools} onValueChange={setTools}>
                  <SelectTrigger id="tools" className={prefilled.tools ? "bg-gray-100 dark:bg-gray-700" : ""}>
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hands-on">Hands-on experiment</SelectItem>
                    <SelectItem value="research">Research-based Project</SelectItem>
                    <SelectItem value="model">Model Building</SelectItem>
                    <SelectItem value="presentation">
                      Presentation or Report
                    </SelectItem>
                    <SelectItem value="creative">Creative Arts</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {prefilled.tools && (
                <p className="text-xs text-gray-500 mt-1">Pre-filled (can be modified)</p>
              )}
            </div>
            {/* Skill Level (Technical Only) */}
            {projectDomain === "technical" && (
              <div>
                <Label htmlFor="skillLevel">Skill Level</Label>
                <Select value={skillLevel} onValueChange={setSkillLevel}>
                  <SelectTrigger id="skillLevel" className={prefilled.skillLevel ? "bg-gray-100 dark:bg-gray-700" : ""}>
                    <SelectValue placeholder="Select skill level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                {prefilled.skillLevel && (
                  <p className="text-xs text-gray-500 mt-1">Pre-filled (can be modified)</p>
                )}
              </div>
            )}
            {/* Project Duration - Now editable */}
            <div>
              <Label htmlFor="projectDuration">Project Duration (days)</Label>
              <Select value={projectDuration} onValueChange={setProjectDuration}>
                <SelectTrigger id="projectDuration" className={prefilled.projectDuration ? "bg-gray-100 dark:bg-gray-700" : ""}>
                  <SelectValue placeholder="Select project duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-7">1-7 days</SelectItem>
                  <SelectItem value="8-14">8-14 days</SelectItem>
                  <SelectItem value="15-30">15-30 days</SelectItem>
                  <SelectItem value="30-60">30-60 days</SelectItem>
                  <SelectItem value="60+">60+ days</SelectItem>
                </SelectContent>
              </Select>
              {prefilled.projectDuration && (
                <p className="text-xs text-gray-500 mt-1">Pre-filled (can be modified)</p>
              )}
            </div>
            {/* Target Audience */}
            <div>
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g., Students, Professionals, General Public"
                className={prefilled.targetAudience ? "bg-gray-100 dark:bg-gray-700" : ""}
              />
              {prefilled.targetAudience && (
                <p className="text-xs text-gray-500 mt-1">Pre-filled (can be modified)</p>
              )}
            </div>
            {/* Grade Level - Now editable */}
            <div>
              <Label htmlFor="grade">Grade Level</Label>
              <Select
                value={grade}
                onValueChange={setGrade}
              >
                <SelectTrigger
                  id="grade"
                  className={prefilled.grade ? "bg-gray-100 dark:bg-gray-700" : ""}
                >
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
              {prefilled.grade && (
                <p className="text-xs text-gray-500 mt-1">Pre-filled (can be modified)</p>
              )}
            </div>
             {/* Detailed Explanation - Now editable */}
            <div className="md:col-span-2">
              <Label htmlFor="detailedExplanation">
                Detailed Project Explanation
              </Label>
              <Textarea
                id="detailedExplanation"
                value={detailedExplanation}
                onChange={(e) => setDetailedExplanation(e.target.value)}
                placeholder="Provide a detailed explanation of your project idea, including any specific requirements or goals."
                className={`h-32 ${prefilled.detailedExplanation ? "bg-gray-100 dark:bg-gray-700" : ""}`}
              />
              {prefilled.detailedExplanation && (
                <p className="text-xs text-gray-500 mt-1">Pre-filled (can be modified)</p>
              )}
            </div>
          </div>
          
          {/* Generate Button */}
          <Button
            onClick={handleGenerateIdea}
            disabled={loading}
            className="w-full"
            suppressHydrationWarning
          >
            {loading ? "Generating..." : "Generate Project Idea"}
          </Button>
        </>
      ) : (
        <div className="mb-6 bg-white border rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <path d="M14 2v6h6"/>
                <path d="M16 13H8"/>
                <path d="M16 17H8"/>
                <path d="M10 9H8"/>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">{savedIdeationName || "Saved Project Ideation"}</h2>
              <p className="text-sm text-gray-500">Created ideation record</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm">
            {subject && (
              <div className="bg-gray-50 p-3 rounded-md">
                <span className="font-medium text-gray-600 block mb-1">Subject:</span>
                <span>{subject}</span>
              </div>
            )}
            {interests && (
              <div className="bg-gray-50 p-3 rounded-md">
                <span className="font-medium text-gray-600 block mb-1">
                  {projectDomain === "technical" ? "Interests:" : "Topic:"}
                </span>
                <span>{interests}</span>
              </div>
            )}
            {tools && (
              <div className="bg-gray-50 p-3 rounded-md">
                <span className="font-medium text-gray-600 block mb-1">
                  {projectDomain === "technical" ? "Tools Known:" : "Project Type:"}
                </span>
                <span>{tools}</span>
              </div>
            )}
            {projectDomain === "technical" && skillLevel && (
              <div className="bg-gray-50 p-3 rounded-md">
                <span className="font-medium text-gray-600 block mb-1">Skill Level:</span>
                <span className="capitalize">{skillLevel}</span>
              </div>
            )}
            {projectDuration && (
              <div className="bg-gray-50 p-3 rounded-md">
                <span className="font-medium text-gray-600 block mb-1">Duration:</span>
                <span>{projectDuration} days</span>
              </div>
            )}
            {targetAudience && (
              <div className="bg-gray-50 p-3 rounded-md">
                <span className="font-medium text-gray-600 block mb-1">Target Audience:</span>
                <span>{targetAudience}</span>
              </div>
            )}
            {grade && (
              <div className="bg-gray-50 p-3 rounded-md">
                <span className="font-medium text-gray-600 block mb-1">Grade Level:</span>
                <span>{grade}{getOrdinalSuffix(parseInt(grade))} Grade</span>
              </div>
            )}
          </div>
        </div>
      )}
      {loading && (
        <div className="text-center mt-4">Generating project idea...</div>
      )}
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          <p>{error}</p>
        </div>
      )}
      {projectIdea && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <h3 className="font-bold text-lg mb-2">Generated Project Idea:</h3>
            <div className="prose prose-sm max-w-none dark:prose-invert dark:bg-gray-900">
              {isEditing ? (
                <Textarea
                  value={editedProjectIdea}
                  onChange={(e) => setEditedProjectIdea(e.target.value)}
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
                    p: ({ node, ...props }) => <p className="mb-4" {...props} />,
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="mb-1" {...props} />
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
                    {projectIdea}
                  </ReactMarkdown>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center mt-4 space-x-2">
              <Button
                onClick={handleGeneratePlan}
                disabled={!projectIdea || loading}
              >
                Generate Timeline
              </Button>
              <Button
                onClick={handleSaveText}
                disabled={!projectIdea || loading}
              >
                {loading ? "Saving..." : "Save Ideation"}
              </Button>
              <Button onClick={handleEditToggle}>
                {isEditing ? "Save Changes" : "Edit"}
              </Button>
              <PdfDownloadButton
                projectName={projectIdea.split("\n")[0].replace(/^#\s*/, "")}
                content={[{ title: "Project Idea", text: projectIdea }]}
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
      {projectIdea && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <h3 className="font-bold text-lg mb-2">Modify Your Idea:</h3>
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
                        p: ({ node, ...props }) => (
                          <p className="mb-4" {...props} />
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
                placeholder="Suggest modifications to your project idea..."
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
      <SaveDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        onSave={handleSaveWithName}
        initialName={savedIdeationName}
      />
    </div>
  );
}
