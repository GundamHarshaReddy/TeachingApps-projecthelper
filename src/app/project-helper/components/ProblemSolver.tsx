"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent } from "../components/ui/card";
import { generateChatResponse } from "../actions/ai";
import ReactMarkdown from "react-markdown";
import { Alert, AlertDescription } from "../components/ui/alert";
import { AlertCircle, ArrowRight } from "lucide-react";
import type { Message, ProjectData, AssistantData } from "../types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";

// Local storage keys
const STORAGE_KEYS = {
  messages: "problemsolver_messages",
};

// Helper function to load state from localStorage
const loadFromStorage = (key: string, defaultValue: any) => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

// Helper function to detect code relationships mentioned in text
const detectCodeRelationships = (content: string): { text: string, relationships: Array<{from: string, to: string, description: string}> } => {
  // Initialize relationships array
  const relationships: Array<{from: string, to: string, description: string}> = [];
  
  // Look for patterns like "X maps to Y" or "X connects to Y" or "X points to Y"
  const mappingPatterns = [
    /(\w+[\w\s.()]+)\s+(?:maps|connects|points|links)\s+to\s+(\w+[\w\s.()]+?)(?:\s+(?:for|which|that|via|through|using)\s+([\w\s.()]+))?[,.]/gi,
    /(\w+[\w\s.()]+)\s+(?:is connected to|is linked with|references)\s+(\w+[\w\s.()]+?)(?:\s+(?:for|which|that|via|through|using)\s+([\w\s.()]+))?[,.]/gi,
    /relationship\s+between\s+(\w+[\w\s.()]+)\s+and\s+(\w+[\w\s.()]+?)(?:\s+(?:for|which|that|via|through|using)\s+([\w\s.()]+))?[,.]/gi
  ];
  
  // Create a modified content with relationship markers
  let modifiedContent = content;
  
  // Apply each pattern
  mappingPatterns.forEach(pattern => {
    modifiedContent = modifiedContent.replace(pattern, (match, from, to, description = '') => {
      // Add to relationships array
      relationships.push({
        from: from.trim(),
        to: to.trim(),
        description: description.trim()
      });
      
      // Modify the text to include relationship markers
      const relationshipId = `rel-${relationships.length}`;
      return `<span class="relationship" data-rel-id="${relationshipId}">${match}</span>`;
    });
  });
  
  return { text: modifiedContent, relationships };
};

// Component to render a message with relationship pointers
const MessageWithRelationships = ({ content }: { content: string }) => {
  const { text, relationships } = detectCodeRelationships(content);
  const [hoveredRelationship, setHoveredRelationship] = useState<number | null>(null);
  
  // If no relationships found, render normal markdown
  if (relationships.length === 0) {
    return (
      <ReactMarkdown
        components={{
          div: ({ children }) => (
            <div className="prose prose-sm max-w-none">{children}</div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  }
  
  // Parse the modified content with relationship markers
  return (
    <div className="prose prose-sm max-w-none">
      <div dangerouslySetInnerHTML={{ __html: text.replace(/<span class="relationship" data-rel-id="(rel-\d+)">(.+?)<\/span>/g, 
        (match, id, text) => {
          const index = parseInt(id.split('-')[1]) - 1;
          return `<span class="relationship bg-blue-100 rounded px-1 cursor-pointer" data-rel-id="${id}">${text}</span>`;
        }) 
      }} />
      
      {relationships.length > 0 && (
        <div className="mt-3 p-2 border border-blue-200 rounded bg-blue-50">
          <div className="text-sm font-medium text-blue-800 mb-1">Relationships:</div>
          {relationships.map((rel, index) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="flex items-center text-xs mb-1 p-1 hover:bg-blue-100 rounded"
                    onMouseEnter={() => setHoveredRelationship(index)}
                    onMouseLeave={() => setHoveredRelationship(null)}
                  >
                    <span className="font-medium">{rel.from}</span>
                    <ArrowRight className="mx-1 w-3 h-3" />
                    <span className="font-medium">{rel.to}</span>
                    {rel.description && <span className="ml-1 text-gray-500">({rel.description})</span>}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Relationship {index + 1}: {rel.from} connects to {rel.to}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      )}
    </div>
  );
};

export default function ProblemSolver({
  projectData,
  toolContext,
  initialMessage,
}: {
  projectData: ProjectData | null;
  toolContext?: AssistantData | null;
  initialMessage?: string | null;
}) {
  const [messages, setMessages] = useState<Message[]>(() => loadFromStorage(STORAGE_KEYS.messages, []));
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    const chatContainer = document.querySelector(".overflow-y-auto");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  // Clear messages when project changes to avoid mixing conversations
  useEffect(() => {
    if (projectData?.id && projectData.id !== projectId) {
      setProjectId(projectData.id);
      setMessages([]);
    }
  }, [projectData?.id, projectId]);

  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      setMessages([
        {
          id: `init-${Date.now()}`,
          role: "user",
          content: initialMessage,
        },
      ]);
      
      setLoading(true);
      (async () => {
        try {
          const assistantResponse = await generateChatResponse(
            [{id: 'initial', role: 'user', content: initialMessage}],
            projectData?.projectName || "Project"
          );
          
          setMessages([
            {
              id: `init-${Date.now()}`,
              role: "user",
              content: initialMessage,
            },
            {
              id: `init-resp-${Date.now()}`,
              role: "assistant",
              content: assistantResponse,
            }
          ]);
        } catch (error) {
          console.error("Error processing initial message:", error);
          setError("Error processing your initial request. Please try again.");
        } finally {
          setLoading(false);
        }
      })();
    } else if (projectData && messages.length === 0 && !initialMessage) {
      setMessages([
        {
          id: `init-${Date.now()}`,
          role: "assistant",
          content: `Hello! I'm your project assistant for "${projectData.projectName || 'your project'}" (Grade: ${projectData.grade || 'N/A'}, Domain: ${projectData.projectDomain || 'N/A'}). How can I help you plan or review your work?`,
        },
      ]);
    } else if (!projectData && messages.length === 0 && !initialMessage) {
      setMessages([
        {
          id: `init-generic-${Date.now()}`,
          role: "assistant",
          content: "Hello! I'm your project assistant. Loading project details...",
        },
      ]);
    }
  }, [projectData, initialMessage, messages.length]);

  useEffect(() => {
    if (toolContext) {
      let contextMessageContent = "Received new context from a tool.";
      
      if (toolContext.diagramContent) {
        // Analyze diagramContent to detect multiple significant types
        const contentLower = toolContext.diagramContent.toLowerCase();
        const typesDetected: string[] = [];
        if (contentLower.includes('mind map')) typesDetected.push('Mind Map');
        if (contentLower.includes('database')) typesDetected.push('Database Schema');
        if (contentLower.includes('canvas')) typesDetected.push('Canvas'); // Covers Business and Lean
        if (contentLower.includes('flowchart')) typesDetected.push('Flowchart');
        if (contentLower.includes('code')) typesDetected.push('Code Snippet');
        
        // Base project context string
        const projectContextInfo = `
**Project:** ${toolContext.topic || 'N/A'}
**Grade Level:** ${toolContext.grade || 'N/A'}
**Domain:** ${toolContext.projectDomain || 'N/A'}
${toolContext.specificGoals && toolContext.specificGoals.length > 0 ? `**Identified Goals:**\\n${toolContext.specificGoals.map(goal => `- ${goal}`).join('\\n')}` : ''}
`;

        // Decide on prompt based on detected types
        if (typesDetected.length > 1) {
          // Mixed Diagram Prompt
          contextMessageContent = `# Mixed Diagram Analysis

I see you've combined several types of elements in your diagram for *${toolContext.topic || 'your project'}*

### Diagram Content Summary:
\`\`\`
${toolContext.diagramContent}
\`\`\`

### Identified Content Types:
${typesDetected.map(type => `- ${type}`).join('\\n')}

### Project Context:
${projectContextInfo}
### How can I help?
1.  **Review Connections:** Analyze how the different parts (e.g., Mind Map, Database) relate.
2.  **Discuss Purpose:** Talk about the role of each section in your overall project.
3.  **Integration Ideas:** Suggest ways to link or integrate the different diagram elements.
4.  **Element-Specific Questions:** Answer questions about specific items (e.g., a database table, a mind map branch).
5.  **Guidance:** Provide technical or conceptual advice based on the combined diagram.

**What aspect of this combined diagram would you like to focus on first?**`;

        } else {
          // Single Specialized Prompt Logic
          switch (toolContext.diagramType) {
            case 'mindmap':
              // Mind Map Prompt
              contextMessageContent = `# Mind Map Analysis

Let's look at the Mind Map for *${toolContext.topic || 'your project'}*.

### Current Structure:
\`\`\`
${toolContext.diagramContent}
\`\`\`

### Project Context:
${projectContextInfo}
### How can I help with your Mind Map?
1.  **Expand Ideas:** Brainstorm and add more branches or details to existing topics.
2.  **Suggest Concepts:** Propose related ideas or themes you could include.
3.  **Organization:** Help structure your thoughts more clearly within the mind map.
4.  **Connections:** Identify and suggest links between different parts of the map.
5.  **Examples:** Provide concrete examples for abstract topics in your map.

**What part of your mind map would you like to refine or discuss?**`;
              break;
  
            case 'database':
             // Database Schema Prompt
             contextMessageContent = `# Database Schema Analysis

Let's review the Database Schema for *${toolContext.topic || 'your project'}*.

### Current Schema:
\`\`\`
${toolContext.diagramContent}
\`\`\`

### Project Context:
${projectContextInfo}
### How can I help with your Database Schema?
1.  **Design Review:** Assess the structure, tables, and fields.
2.  **Optimization:** Suggest ways to improve performance or normalization.
3.  **Relationships:** Discuss primary/foreign keys and table connections.
4.  **Completeness:** Help identify missing tables, fields, or constraints.
5.  **Data Structure:** Advise on appropriate data types and structures.

**What aspect of the database schema needs attention?**`;
              break;
  
            case 'businessCanvas':
            case 'leanCanvas':
              // Canvas Prompt
              const canvasType = toolContext.diagramType === 'businessCanvas' ? 'Business Model Canvas' : 'Lean Canvas';
              const canvasSections = toolContext.diagramType === 'businessCanvas' ? `
- Value Propositions
- Customer Segments
- Key Partners
- Key Activities
- Key Resources
- Customer Relationships
- Channels
- Cost Structure
- Revenue Streams` : `
- Problem
- Solution
- Unique Value Proposition
- Unfair Advantage
- Customer Segments
- Key Metrics
- Channels
- Cost Structure
- Revenue Streams`;
              contextMessageContent = `# ${canvasType} Analysis

Let's examine the ${canvasType} for *${toolContext.topic || 'your project'}*.

### Current Canvas Structure:
\`\`\`
${toolContext.diagramContent}
\`\`\`

### Canvas Sections:
${canvasSections}

### Project Context:
${projectContextInfo}
### How can I help with your ${canvasType}?
1.  **Section Review:** Deep dive into specific sections (e.g., Value Proposition, Key Metrics).
2.  **Suggest Improvements:** Offer ideas to strengthen each part of the canvas.
3.  **Identify Gaps:** Point out potentially missing elements or weak assumptions.
4.  **Connections:** Analyze how the different sections logically connect.
5.  **Validation:** Discuss ways to test the assumptions made in your canvas.

**Which section of the ${canvasType} should we focus on?**`;
              break;
  
            case 'flowchart':
             // Flowchart Prompt
             contextMessageContent = `# Flowchart Analysis

Let's analyze the Flowchart for *${toolContext.topic || 'your project'}*.

### Current Structure:
\`\`\`
${toolContext.diagramContent}
\`\`\`

### Project Context:
${projectContextInfo}
### How can I help with your Flowchart?
1.  **Process Logic:** Review the sequence of steps and overall flow.
2.  **Decision Points:** Ensure conditions and branches are clear and cover all cases.
3.  **Error Handling:** Suggest ways to incorporate error conditions or alternative paths.
4.  **Optimization:** Identify potential redundancies or areas for streamlining.
5.  **Completeness:** Check if any crucial steps or end states are missing.

**What part of the flowchart process would you like to examine?**`;
              break;
  
            default:
               // Default Diagram Prompt
              contextMessageContent = `# Diagram Analysis

I've received the diagram for *${toolContext.topic || 'your project'}*.

### Diagram Content:
\`\`\`
${toolContext.diagramContent}
\`\`\`

### Project Context:
${projectContextInfo}
### How can I help with this diagram?
1.  **Review Components:** Discuss the individual elements and their connections.
2.  **Suggest Improvements:** Offer ideas for refinement or adding missing parts.
3.  **Clarify Sections:** Answer questions about specific elements or relationships.
4.  **Guidance:** Provide technical or conceptual advice related to the diagram.
5.  **Educational Links:** Discuss how the diagram relates to learning objectives.

**What would you like to discuss about this diagram?**`;
          }
        }
      }

      // Add message to chat if it's new
      if (messages.length > 0 && messages[messages.length - 1].content !== contextMessageContent) {
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: `context-${Date.now()}`,
            role: "assistant",
            content: contextMessageContent,
          },
        ]);
      }
    }
  }, [toolContext, messages]);

  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent,
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const assistantResponse = await generateChatResponse(
        updatedMessages,
        projectData?.projectName || "Project"
      );
      const finalMessages: Message[] = [
        ...updatedMessages,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: assistantResponse,
        },
      ];
      setMessages(finalMessages);
    } catch (error) {
      console.error("Error sending message:", error);
      setError(
        "An error occurred while processing your message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col h-[600px] overflow-hidden">
      <Card className="flex-grow overflow-hidden mb-4">
        <CardContent className="p-4 h-full overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${message.role === "user" ? "text-right" : "text-left"} w-full`}
            >
              <div
                className={`inline-block p-3 rounded-lg ${
                  message.role === "user" ? "bg-gray-100" : "bg-gray-300"
                } text-gray-800 ${message.role === "user" ? "ml-auto text-left" : "mr-auto"} max-w-[80%]`}
              >
                {message.role === "assistant" ? (
                  <MessageWithRelationships content={message.content} />
                ) : (
                  <ReactMarkdown>
                    {message.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="flex space-x-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your project..."
          className="flex-grow resize-none"
          rows={2}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(input);
            }
          }}
        />
        <Button onClick={() => handleSendMessage(input)} disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </Button>
      </div>
    </div>
  );
}
