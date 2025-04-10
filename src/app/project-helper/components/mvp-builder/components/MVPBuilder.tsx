"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/app/project-helper/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/project-helper/components/ui/tabs'
import { Input } from '@/app/project-helper/components/ui/input'
import { Textarea } from '@/app/project-helper/components/ui/textarea'
import { cn } from '@/app/project-helper/lib/utils'
import { useToast } from '@/app/project-helper/components/ui/use-toast'
import CodePreview from './CodePreview'
import { 
  PanelRight, 
  Rocket, 
  Send, 
  Code, 
  Settings, 
  History, 
  Moon, 
  Sun, 
  PlusCircle, 
  Github,
  Loader2,
  Check,
  Save,
  X,
  Pencil,
  LayoutGrid,
  RefreshCw
} from 'lucide-react'

// API call function that connects to Groq API
const generateCode = async (prompt: string): Promise<string> => {
  try {
    // Enhanced debugging for API key
    console.log("Available environment variables:");
    console.log("GROQ_API_KEY exists:", process.env.GROQ_API_KEY ? "Yes" : "No");
    console.log("process.env keys:", Object.keys(process.env).filter(key => key.includes('GROQ') || key.includes('API')));
    
    // Attempt to read API key from different possible environment variable names
    let apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;
    
    // More explicit debugging
    console.log("API Key found:", apiKey ? "Yes (starts with " + apiKey.substring(0, 4) + "...)" : "No");
    
    if (!apiKey) {
      console.warn(`
      =============================================
      NO API KEY FOUND - TROUBLESHOOTING TIPS
      =============================================
      1. Make sure your .env.local file contains: GROQ_API_KEY=your_key_here
      2. Alternatively, use NEXT_PUBLIC_GROQ_API_KEY=your_key_here
      3. Restart your Next.js server completely
      4. Make sure there are no spaces around the equals sign
      5. Try accessing the key as both GROQ_API_KEY and NEXT_PUBLIC_GROQ_API_KEY
      =============================================
      `);
      
      // Let's provide a solution - try hardcoding for now 
      console.warn("Using mock response due to missing API key. See console for troubleshooting tips.");
      return mockGenerateCode(prompt);
    }
    
    console.log("Using Groq API with key:", apiKey.substring(0, 3) + "..." + apiKey.substring(apiKey.length - 3));
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content: "You are a React component generator. Generate only the code for a React component based on the user's description. Use modern React with hooks and Tailwind CSS for styling. Provide clean, well-commented, production-ready code with reasonable defaults. Do not include any explanation, just the code."
          },
          {
            role: "user",
            content: `Create a React component for: ${prompt}`
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API call failed:', errorText);
      throw new Error(`API call failed with status ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log("API response received:", data);
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error calling Groq API:", error);
    alert("Error calling Groq API. Check console for details and ensure you have set GROQ_API_KEY in your .env.local file.");
    // Fallback to mock implementation
    return mockGenerateCode(prompt);
  }
};

// Mock API call function as fallback (same as before)
const mockGenerateCode = async (prompt: string): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return mock response based on prompt keywords
  if (prompt.toLowerCase().includes('hello')) {
    return `export default function Hello() {
  return <h1>Hello, World!</h1>;
}`;
  } else if (prompt.toLowerCase().includes('button')) {
    return `import React from 'react';

function Button({ text, onClick, color = "blue" }) {
  return (
    <button
      onClick={onClick}
      className={\`px-4 py-2 rounded font-medium text-white bg-\${color}-500 hover:bg-\${color}-600 focus:outline-none focus:ring-2 focus:ring-\${color}-400 focus:ring-opacity-50 transition-colors\`}
    >
      {text}
    </button>
  );
}

export default Button;`;
  } else {
    return `import React from 'react';

function Component() {
  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
      <div className="md:flex">
        <div className="p-8">
          <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Component</div>
          <p className="mt-2 text-gray-500">This is a sample component generated based on your prompt.</p>
          </div>
        </div>
    </div>
  );
}

export default Component;`;
  }
};

// Add a function to help set up environment variables
const checkEnvironmentSetup = () => {
  console.log("=== Environment Variable Check ===");
  
  // Try different possible environment variable names
  const apiKeyVariants = {
    'GROQ_API_KEY': process.env.GROQ_API_KEY,
    'NEXT_PUBLIC_GROQ_API_KEY': process.env.NEXT_PUBLIC_GROQ_API_KEY,
  };
  
  console.log("Environment variable presence check:");
  Object.entries(apiKeyVariants).forEach(([name, value]) => {
    console.log(`- ${name}: ${value ? 'Present' : 'Missing'}`);
  });
  
  // Check for any environment variables that might contain our key
  const allEnvKeys = Object.keys(process.env);
  const relevantKeys = allEnvKeys.filter(key => 
    key.includes('GROQ') || 
    key.includes('API') || 
    key.includes('KEY')
  );
  
  if (relevantKeys.length > 0) {
    console.log("Found potentially relevant environment variables:", relevantKeys);
  }
  
  if (!process.env.GROQ_API_KEY && !process.env.NEXT_PUBLIC_GROQ_API_KEY) {
    console.warn(`
=============================================
ENVIRONMENT VARIABLE NOT FOUND
=============================================
Neither GROQ_API_KEY nor NEXT_PUBLIC_GROQ_API_KEY was found.

IMPORTANT: Next.js requires a restart after changing .env.local
SOLUTION: Try one of these approaches:

1. Client-side usage (recommended): 
   Add to .env.local: NEXT_PUBLIC_GROQ_API_KEY=your_key_here

2. Server-side only usage:
   Add to .env.local: GROQ_API_KEY=your_key_here
   (But you'll need to create an API route to use it)

3. Manual override (temporary test):
   Open this file and look for "MANUAL OVERRIDE OPTION" comment
=============================================
    `);
  } else {
    console.log("Groq API key is configured. If you're still having issues, check if the key format is correct.");
  }
};

// Override option - UNCOMMENT BELOW TO TEST (remove after testing)
// MANUAL OVERRIDE OPTION - Delete this when done testing
// const OVERRIDE_API_KEY = "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";

type Prompt = {
  id: string;
  text: string;
  createdAt: Date;
}

export default function MVPBuilder() {
  const [activeTab, setActiveTab] = useState<string>("new");
  const [prompt, setPrompt] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [editedCode, setEditedCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [history, setHistory] = useState<Prompt[]>([]);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [codeView, setCodeView] = useState<'code' | 'preview' | 'split'>('code');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [livePreview, setLivePreview] = useState(false);
  const [isUsingMock, setIsUsingMock] = useState<boolean>(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  
  // Check environment setup on component mount
  useEffect(() => {
    checkEnvironmentSetup();
  }, []);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    // Save to history
    const newPrompt = {
      id: Date.now().toString(),
      text: prompt,
      createdAt: new Date()
    };
    
    setHistory(prev => [newPrompt, ...prev]);
    
    // Generate code
    setIsLoading(true);
    setIsUsingMock(false);
    try {
      console.log("Generating code for prompt:", prompt);
      const startTime = Date.now();
      
      // Check if we have the API key - try multiple possibilities
      const apiKey = process.env.GROQ_API_KEY || 
                     process.env.NEXT_PUBLIC_GROQ_API_KEY; 
                     // || OVERRIDE_API_KEY; // Uncomment to test override
      
      if (!apiKey) {
        setIsUsingMock(true);
        console.warn("Using mock data because API key is not set");
      }
      
      const generatedCode = await generateCode(prompt);
      
      const endTime = Date.now();
      console.log(`Code generation took ${(endTime - startTime) / 1000} seconds`);
      
      // If it took less than 2 seconds, it's likely using mock data
      if (endTime - startTime < 2000 && !prompt.toLowerCase().includes('hello') && !prompt.toLowerCase().includes('button')) {
        setIsUsingMock(true);
        console.warn("Response time suggests mock data was used");
      }
      
      setCode(generatedCode);
      setEditedCode(generatedCode);
      
      // Always set to code view initially to show what was generated
      setCodeView('code');
      
      // Show a hint toast or alert about the preview tab
      // This would be a good place to add a toast notification if you have a toast component
      
    } catch (error) {
      console.error("Error generating code:", error);
      setIsUsingMock(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load prompt from history
  const loadPrompt = (promptId: string) => {
    const selectedPrompt = history.find(p => p.id === promptId);
    if (selectedPrompt) {
      setPrompt(selectedPrompt.text);
      setActiveTab("new");
      
      // Focus the prompt input
      setTimeout(() => {
        if (promptInputRef.current) {
          promptInputRef.current.focus();
        }
      }, 100);
    }
  };
  
  // Toggle dark/light mode
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    // Apply dark mode to the document body for global styling
    document.body.classList.toggle('dark', !darkMode);
  };
  
  // Initialize dark mode on component mount
  useEffect(() => {
    // Check if user has a preference in localStorage
    const savedDarkMode = localStorage.getItem('mvpBuilderDarkMode');
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
    }
    
    // Apply initial dark mode setting
    document.body.classList.toggle('dark', darkMode);
    
    // Clean up on unmount
    return () => {
      document.body.classList.remove('dark');
    };
  }, []);
  
  // Save dark mode preference when it changes
  useEffect(() => {
    localStorage.setItem('mvpBuilderDarkMode', darkMode.toString());
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);
  
  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };
  
  // Scroll editor to bottom when code changes
  useEffect(() => {
    if (editorRef.current && code) {
      editorRef.current.scrollTop = 0;
    }
  }, [code]);
  
  // Add useEffect to monitor activeTab changes
  useEffect(() => {
    console.log('Active tab changed to:', activeTab);
  }, [activeTab]);
  
  // Copy code to clipboard
  const copyToClipboard = () => {
    try {
      navigator.clipboard.writeText(code);
      setCopySuccess(true);
      
      // Show toast notification
      toast({
        title: "Code copied",
        description: "The code has been copied to your clipboard",
      });
      
      // Reset copy success state after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
      toast({
        title: "Copy failed",
        description: "Failed to copy code to clipboard",
        variant: "destructive",
      });
    }
  };
  
  // Handle code editing
  const handleCodeEdit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedCode(e.target.value);
  };

  // Save edited code
  const saveEditedCode = () => {
    setCode(editedCode);
    setIsEditing(false);
    
    // Update preview after saving
    if (codeView === 'preview' || codeView === 'split') {
      // Force preview refresh with the new code
      const previewIframe = document.querySelector('iframe');
      if (previewIframe) {
        try {
          // We need to recreate the iframe to ensure it refreshes properly
          setTimeout(() => {
            if (previewIframe) {
              previewIframe.srcdoc = generatePreviewHtml(editedCode);
            }
          }, 100);
        } catch (error) {
          console.error("Error updating preview after save:", error);
        }
      }
    }
    
    toast({
      title: "Code saved",
      description: "Your changes have been saved",
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditedCode(code);
    setIsEditing(false);
  };

  // Function to refresh the preview iframe
  const refreshPreview = () => {
    const currentCode = isEditing ? editedCode : code;
    const previewIframe = document.querySelector('iframe');
    
    if (previewIframe) {
      try {
        previewIframe.srcdoc = generatePreviewHtml(currentCode);
      } catch (error) {
        console.error("Error refreshing preview:", error);
        toast({
          title: "Preview error",
          description: "Failed to refresh preview",
          variant: "destructive",
        });
      }
    }
  };

  // Reset edited code
  const resetEditedCode = () => {
    setEditedCode(code);
    setIsEditing(false);
  };
  
  // Process code to make it compatible with browser Babel
  const processCodeForPreview = (codeToRender: string): string => {
    // First remove all import statements
    let processedCode = codeToRender.replace(/import.*?;/g, '');
    
    // Extract the component function from export default statements
    if (processedCode.includes('export default')) {
      // Find the component name if it's in format: export default function ComponentName() {...}
      const componentNameMatch = processedCode.match(/export\s+default\s+function\s+([A-Za-z0-9_]+)/);
      const componentName = componentNameMatch ? componentNameMatch[1] : 'App';
      
      // Replace "export default function ComponentName" with just "function ComponentName"
      processedCode = processedCode.replace(/export\s+default\s+function\s+([A-Za-z0-9_]+)/, 'function $1');
      
      // If it's in format: export default ComponentName;
      processedCode = processedCode.replace(/export\s+default\s+([A-Za-z0-9_]+);/, '');
      
      // Handle arrow functions: export default () => { ... }
      if (processedCode.includes('export default (') || processedCode.includes('export default () =>')) {
        processedCode = processedCode.replace(/export\s+default\s+(\(.*?\)\s*=>|[^{]*=>)/, 'const App = $1');
      }
      
      // Handle object exports: export default { ... }
      processedCode = processedCode.replace(/export\s+default\s+\{/, 'const exported = {');
      
      return processedCode;
    }
    
    return processedCode;
  };

  // Generate preview HTML with proper React and styling support
  const generatePreviewHtml = (codeToRender: string) => {
    // Simple preprocessing - strip export and import statements
    let processedCode = codeToRender
      .replace(/import\s+.*?;/g, '')
      .replace(/export\s+default\s+/, '');
    
    // Extract component name if possible
    let componentName = 'Component';
    const functionMatch = processedCode.match(/function\s+([A-Za-z0-9_]+)/);
    if (functionMatch && functionMatch[1]) {
      componentName = functionMatch[1];
    }
    
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <style>
    body { 
      margin: 0; 
      padding: 0; 
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      background-color: white;
    }
    
    #root { 
      min-height: 100vh; 
      width: 100%;
    }
    
    /* Base styles */
    :root {
      --background: 0 0% 100%;
      --foreground: 222.2 84% 4.9%;
      --card: 0 0% 100%;
      --card-foreground: 222.2 84% 4.9%;
      --primary: 221.2 83.2% 53.3%;
      --primary-foreground: 210 40% 98%;
      --secondary: 210 40% 96.1%;
      --secondary-foreground: 222.2 47.4% 11.2%;
      --destructive: 0 84.2% 60.2%;
      --border: 214.3 31.8% 91.4%;
      --ring: 221.2 83.2% 53.3%;
      --radius: 0.5rem;
    }
    
    /* Loading styles */
    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      width: 100%;
      background-color: white;
    }
    
    .loading-spinner {
      border: 3px solid rgba(0, 0, 0, 0.1);
      border-top-color: #3b82f6;
      border-radius: 50%;
      width: 2rem;
      height: 2rem;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    /* Error styles */
    .error-container {
      padding: 1.5rem;
      background-color: #fee2e2;
      border: 1px solid #fecaca;
      border-radius: 0.5rem;
      margin: 1.5rem;
    }
    
    .error-title {
      color: #dc2626;
      font-weight: bold;
      margin-bottom: 0.5rem;
      font-size: 1.25rem;
    }
    
    .error-message {
      color: #b91c1c;
      font-family: monospace;
      padding: 0.75rem;
      background-color: #fff1f2;
      border-radius: 0.25rem;
      white-space: pre-wrap;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <div id="root">
    <div class="loading-container">
      <div class="loading-spinner"></div>
    </div>
  </div>
  
  <script src="https://unpkg.com/react@17/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone@7.16.7/babel.min.js" crossorigin></script>
  
  <script type="text/babel">
    // Define the component
    const ${componentName} = ${processedCode}
    
    // Render the component with error boundary
    try {
      ReactDOM.render(<${componentName} />, document.getElementById('root'));
      } catch (error) {
        console.error("Preview error:", error);
        document.getElementById('root').innerHTML = \`
        <div class="error-container">
          <div class="error-title">Error in Preview</div>
          <p>There was an error rendering the component:</p>
          <div class="error-message">\${error.message}</div>
          </div>
        \`;
      }
  </script>
</body>
</html>`;
  };
  
  // Focus the prompt input on initial load
  useEffect(() => {
    if (promptInputRef.current) {
      promptInputRef.current.focus();
    }
  }, []);
  
  return (
    <div className="w-full h-screen flex flex-col md:flex-row overflow-hidden bg-gray-50">
      {/* Left Panel - Prompt Input */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full p-4 md:p-6 flex flex-col border-b md:border-b-0 md:border-r border-gray-200">
        <h2 className="text-xl font-medium mb-4 text-gray-800">Prompt</h2>
        
        {/* API Key Status Notice */}
        {!(process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY) && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
            <strong>API Key Missing:</strong> Using mock data. To use Groq API, add NEXT_PUBLIC_GROQ_API_KEY to your .env.local file and restart the server.
            <div className="mt-2 text-xs">
              <strong>Note:</strong> The key must be prefixed with NEXT_PUBLIC_ to be accessible in browser code.
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
                    <Textarea
                      ref={promptInputRef}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here... (e.g., 'Create a button component')"
            className="flex-grow resize-none p-4 text-base rounded border-gray-300 text-gray-800 bg-white"
                      disabled={isLoading}
                    />
          <button 
                        type="submit" 
                        disabled={isLoading || !prompt.trim()}
            className={cn(
              "mt-4 py-2 px-4 rounded text-white font-medium",
              isLoading || !prompt.trim() 
                ? "bg-blue-400 cursor-not-allowed" 
                : "bg-blue-500 hover:bg-blue-600"
            )}
                      >
                        {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generating...
              </span>
            ) : (
              "Generate Code"
            )}
          </button>
                  </form>
                </div>
      
      {/* Right Panel - Code Output and Preview */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col overflow-hidden">
        {/* Code Output Section */}
        <div className="h-1/2 p-4 md:p-6 overflow-auto border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium text-gray-800">Code Output</h2>
            <div className="flex items-center">
              {isUsingMock && (
                <span className="mr-3 text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800">Using Mock Data</span>
              )}
              {code && !isLoading && !isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-3 py-1.5 text-sm font-medium rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  <Pencil className="h-4 w-4 mr-1.5" />
                  Edit Code
                </button>
              )}
              {isEditing && (
                <div className="flex space-x-2">
                  <button 
                    onClick={saveEditedCode}
                    className="flex items-center px-3 py-1.5 text-sm font-medium rounded bg-green-100 hover:bg-green-200 text-green-700"
                  >
                    <Save className="h-4 w-4 mr-1.5" />
                    Save
                  </button>
                  <button 
                    onClick={cancelEditing}
                    className="flex items-center px-3 py-1.5 text-sm font-medium rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                  >
                    <X className="h-4 w-4 mr-1.5" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center h-[calc(100%-40px)] p-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Generating code...</span>
            </div>
          ) : code ? (
            isEditing ? (
              <Textarea
                value={editedCode}
                onChange={handleCodeEdit}
                className="w-full h-[calc(100%-40px)] p-4 text-sm font-mono border border-gray-200 rounded resize-none text-gray-800 bg-white"
              />
            ) : (
              <pre className="bg-gray-50 p-4 rounded border border-gray-200 overflow-auto h-[calc(100%-40px)]">
                <code className="text-sm font-mono text-gray-800">{code}</code>
              </pre>
            )
          ) : (
            <div className="flex items-center justify-center h-[calc(100%-40px)] bg-white rounded border border-gray-200 text-gray-500">
              Code output will appear here
            </div>
          )}
        </div>
        
        {/* Preview Section */}
        <div className="h-1/2 p-4 md:p-6 overflow-auto">
          <h2 className="text-xl font-medium mb-4 text-gray-800">Preview</h2>
          <div className="bg-white border border-gray-200 rounded h-[calc(100%-40px)] overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Generating preview...</span>
              </div>
            ) : code ? (
              <div className="h-full w-full">
                <CodePreview code={isEditing ? editedCode : code} darkMode={false} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Preview will appear here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
