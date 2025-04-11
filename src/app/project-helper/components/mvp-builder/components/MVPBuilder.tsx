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
            content: `You are a helpful React component generator that creates interactive and engaging components.

Key requirements:
1. Use modern React with hooks and Tailwind CSS for styling
2. Create clean, well-commented code with reasonable defaults 
3. Provide your code inside a markdown code block using triple backticks
4. Provide any explanations or descriptions as plain text BEFORE or AFTER the code block, never inside it

When creating components:
1. Write efficient, clean code that follows best practices
2. Include sensible defaults and props for flexibility
3. Ensure the component is self-contained and reusable
4. Put explanations about the code in plain text before or after the code block, not inside as comments`
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
    // Clean the response to remove any backticks that might surround the code
    let content = data.choices[0].message.content.trim();
    
    // Remove markdown code block syntax if present
    content = content.replace(/^```[\w]*\n/, '').replace(/```$/, '');
    
    return content;
  } catch (error) {
    console.error("Error calling Groq API:", error);
    alert("Error calling Groq API. Check console for details and ensure you have set GROQ_API_KEY in your .env.local file.");
    // Fallback to mock implementation
    return mockGenerateCode(prompt);
  }
};

// Mock API call function as fallback
const mockGenerateCode = async (prompt: string): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  let code = "";
  let explanation = "";
  
  // For follow-up requests that modify existing code
  if (prompt.toLowerCase().includes('based on my previous request') || 
      prompt.toLowerCase().includes('update') || 
      prompt.toLowerCase().includes('change')) {
    
    // For updates to the portfolio website
    if (prompt.toLowerCase().includes('portfolio')) {
      explanation = "I've updated the portfolio website with a blue theme as requested. The header now has blue accent colors and improved hover states for the navigation links.";
      code = `import React from 'react';

// Updated Portfolio website component
export default function Portfolio() {
  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header with updated styles */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600">Your Name</h1>
            </div>
            <nav className="flex items-center space-x-8">
              <a href="#about" className="text-gray-600 hover:text-blue-600">About</a>
              <a href="#projects" className="text-gray-600 hover:text-blue-600">Projects</a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Rest of the component - updated as requested */}
      {/* ... */}
    </div>
  );
}`;
    }
    
    // For button color changes
    if (prompt.toLowerCase().includes('button') && prompt.toLowerCase().includes('color')) {
      explanation = "I've updated the Button component with more color options. The button now supports blue, red, green, purple, and indigo colors with matching hover and focus states for each.";
      code = `import React from 'react';

function Button({ text, onClick, color = "blue" }) {
  // Color options expanded for more flexibility
  const colorStyles = {
    blue: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-400',
    red: 'bg-red-500 hover:bg-red-600 focus:ring-red-400',
    green: 'bg-green-500 hover:bg-green-600 focus:ring-green-400',
    purple: 'bg-purple-500 hover:bg-purple-600 focus:ring-purple-400',
    indigo: 'bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-400',
  };
  
  // Default to blue if the specified color isn't in our map
  const colorStyle = colorStyles[color] || colorStyles.blue;
  
  return (
    <button
      onClick={onClick}
      className={\`px-4 py-2 rounded font-medium text-white \${colorStyle} focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors\`}
    >
      {text}
    </button>
  );
}

export default Button;`;
    }
  }
  
  // Original code for first-time requests
  if (prompt.toLowerCase().includes('hello')) {
    explanation = "Here's a simple Hello World component. You can customize the text inside the h1 tag to change the message.";
    code = `export default function Hello() {
  return <h1>Hello, World!</h1>;
}`;
  } else if (prompt.toLowerCase().includes('button') && !code) {
    explanation = "This is a customizable Button component that accepts text content, a click handler, and a color prop (defaulting to blue). The component uses Tailwind CSS for styling with hover and focus states.";
    code = `import React from 'react';

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
  } else if ((prompt.toLowerCase().includes('portfolio') || prompt.toLowerCase().includes('website')) && !code) {
    explanation = `This is a complete portfolio website component with multiple sections:

1. A responsive header with navigation links
2. A hero section with a gradient background
3. An about section with a profile image and skills tags
4. A projects section displaying a grid of projects
5. A contact form section
6. A footer with copyright information

The component uses Tailwind CSS for styling and is fully responsive. You can customize each section by replacing the placeholder content with your own information.`;
    
    code = `import React from 'react';

// Simple Portfolio website component
export default function Portfolio() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header / Navbar */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Your Name</h1>
            </div>
            <nav className="flex items-center space-x-8">
              <a href="#about" className="text-gray-600 hover:text-gray-900">About</a>
              <a href="#projects" className="text-gray-600 hover:text-gray-900">Projects</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-50 to-blue-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            <span className="block">Hello, I'm Your Name</span>
            <span className="block text-purple-600">Web Developer</span>
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            I build beautiful and functional websites with modern technologies.
          </p>
          <div className="mt-8">
            <a href="#contact" className="bg-purple-600 text-white px-6 py-3 rounded-md font-medium shadow-md hover:bg-purple-700 transition-colors duration-300">
              Get in touch
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">About Me</h2>
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/3 flex justify-center">
              <div className="w-48 h-48 rounded-full overflow-hidden shadow-xl">
                <img src="https://via.placeholder.com/300x300" alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="w-full md:w-2/3">
              <p className="text-lg text-gray-700 mb-4">
                I'm a web developer with experience in building responsive and performant web applications.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm">React</span>
                <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm">JavaScript</span>
                <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm">Tailwind CSS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-16 bg-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">My Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-lg overflow-hidden shadow-md">
                <img src={\`https://via.placeholder.com/300x200?text=Project+\${item}\`} alt={\`Project \${item}\`} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Project {item}</h3>
                  <p className="text-gray-700 mb-4">This is a description for Project {item}.</p>
                  <button className="text-purple-600 hover:text-purple-800 font-medium">
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Get In Touch</h2>
          <div className="bg-white shadow-md rounded-lg p-8">
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" id="name" className="w-full px-4 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" id="email" className="w-full px-4 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea id="message" rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-md"></textarea>
              </div>
              <div>
                <button type="submit" className="w-full bg-purple-600 text-white px-6 py-3 rounded-md font-medium">
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; {new Date().getFullYear()} Your Name. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}`;
  } else if (!code) {
    explanation = "Here's a simple React component with Tailwind CSS styling. This is a generic card component that you can customize for your specific needs.";
    code = `import React from 'react';

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
  
  // Format the response with markdown code blocks
  return explanation ? explanation + "\n\n```jsx\n" + code + "\n```" : "```jsx\n" + code + "\n```";
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
  // UI state management
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
  const [chatMessages, setChatMessages] = useState<Array<{type: 'user' | 'assistant', content: string}>>([]);
  
  // Active tab for right panel
  const [rightPanelTab, setRightPanelTab] = useState<'code' | 'preview'>('code');
  
  // Bolt structure controls
  const [layout, setLayout] = useState<'horizontal' | 'vertical'>('vertical');
  const [pinnedSections, setPinnedSections] = useState<{
    prompt: boolean;
    code: boolean;
    preview: boolean;
  }>({
    prompt: true,
    code: true,
    preview: true
  });
  
  // Actively focused section
  const [activeFocus, setActiveFocus] = useState<'prompt' | 'code' | 'preview' | null>(null);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  
  // Check environment setup on component mount
  useEffect(() => {
    checkEnvironmentSetup();
  }, []);
  
  // Process code to extract comments and clean it
  const processCodeAndExtractMessages = (rawCode: string): { cleanCode: string, message: string } => {
    // Extract code block from markdown if present
    let cleanCode = '';
    let message = '';
    
    // Check if the response has a markdown code block
    const codeBlockMatch = rawCode.match(/```(?:jsx|tsx|js|javascript)?([\s\S]*?)```/);
    
    if (codeBlockMatch) {
      // Extract the code inside the backticks
      cleanCode = codeBlockMatch[1].trim();
      
      // Extract any text before or after the code block as a message
      const parts = rawCode.split(/```(?:jsx|tsx|js|javascript)?[\s\S]*?```/);
      message = parts.filter(Boolean).join('\n').trim();
    } else if (rawCode.includes('import ') || rawCode.includes('function ') || rawCode.includes('const ')) {
      // If no code block markers but looks like code
      cleanCode = rawCode;
    } else {
      // If it doesn't look like code, treat the whole thing as a message
      message = rawCode;
    }
    
    return { cleanCode, message: message };
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    // Add to chat history
    setChatMessages(prev => [...prev, { type: 'user', content: prompt }]);
    
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
      
      // Process the generated code to extract any conversational messages
      const { cleanCode, message } = processCodeAndExtractMessages(generatedCode);
      
      const endTime = Date.now();
      console.log(`Code generation took ${(endTime - startTime) / 1000} seconds`);
      
      // If it took less than 2 seconds, it's likely using mock data
      if (endTime - startTime < 2000 && !prompt.toLowerCase().includes('hello') && !prompt.toLowerCase().includes('button')) {
        setIsUsingMock(true);
        console.warn("Response time suggests mock data was used");
      }
      
      setCode(cleanCode);
      setEditedCode(cleanCode);
      
      // Add assistant message to chat if there is one
      if (message) {
        setChatMessages(prev => [...prev, { type: 'assistant', content: message }]);
      }
      
      // Always set to code view initially to show what was generated
      setRightPanelTab('code');
      
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
    
    // Clean the code to remove any backticks in case they weren't caught earlier
    const cleanedCode = currentCode.replace(/^```[\w]*\n/, '').replace(/```$/, '').trim();
    
    if (previewIframe) {
      try {
        previewIframe.srcdoc = generatePreviewHtml(cleanedCode);
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
    // First, process the code to handle imports and export statements
    let processedCode = processCodeForPreview(codeToRender);
    
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
  <script src="https://unpkg.com/react@17/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone@7.16.7/babel.min.js" crossorigin></script>
  <style>
    html, body { 
      margin: 0; 
      padding: 0; 
      height: 100%;
      width: 100%;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      background-color: white;
      overflow: auto;
    }
    
    #root { 
      min-height: 100%;
      width: 100%;
      overflow: auto;
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
    
    /* Mock UI component styles */
    .mock-ui-component {
      padding: 8px;
      border: 1px dashed #CBD5E0;
      border-radius: 4px;
      margin: 4px 0;
      position: relative;
    }
    
    .mock-ui-component::before {
      content: attr(class);
      position: absolute;
      top: -10px;
      left: 8px;
      background-color: white;
      padding: 0 4px;
      font-size: 10px;
      color: #718096;
    }

    /* Fix for overflow in preview */
    .scroll-container {
      width: 100%;
      height: 100%;
      overflow: auto;
    }
  </style>
</head>
<body>
  <div id="root">
    <div class="loading-container">
      <div class="loading-spinner"></div>
    </div>
  </div>
  
  <script type="text/babel">
    // Make React hooks available
    const { useState, useEffect, useRef, useContext, useReducer, useCallback, useMemo } = React;
    
    // Mock external libraries
    const mockComponent = (name) => props => {
      return React.createElement('div', {
        className: 'mock-ui-component',
        style: { padding: '8px', border: '1px dashed #CBD5E0' }
      }, 
      [
        React.createElement('span', {
          style: { color: '#888', fontSize: '12px', display: 'block', marginBottom: '4px' }
        }, '[Mock ' + name + ']'),
        props.children || null
      ]);
    };
    
    // Create mock implementations for common libraries
    window.mockLibraries = {
      // UI Libraries
      '@mui/material': ['Button', 'TextField', 'Select', 'Container', 'Grid', 'Box'],
      '@chakra-ui/react': ['Button', 'Input', 'Box', 'Container', 'Stack', 'Flex'],
      'antd': ['Button', 'Input', 'Select', 'Layout', 'Space', 'Card'],
      
      // Icons
      '@heroicons/react/24/solid': ['HomeIcon', 'UserIcon', 'CogIcon'],
      '@heroicons/react/24/outline': ['HomeIcon', 'UserIcon', 'CogIcon'],
      
      // Other common libraries
      'axios': true,
      'swr': true,
      'next/router': true,
      'next/image': true
    };
    
    // Create mock implementations for common imports
    Object.entries(window.mockLibraries).forEach(([library, components]) => {
      if (Array.isArray(components)) {
        components.forEach(comp => {
          window[comp] = mockComponent(comp);
        });
      }
    });
    
    // Mock fetch API
    const originalFetch = window.fetch;
    window.fetch = (url, options) => {
      console.log('Preview: Mocking fetch for', url);
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ 
          success: true, 
          message: 'This is mock data from fetch',
          data: [
            { id: 1, name: 'Mock Item 1' },
            { id: 2, name: 'Mock Item 2' },
            { id: 3, name: 'Mock Item 3' }
          ] 
        }),
        text: () => Promise.resolve('Mock text response'),
        headers: new Headers({ 'Content-Type': 'application/json' })
      });
    };
    
    // Wrap the processed code in error handling
    try {
      // Execute the code
      ${processedCode}
      
      // Determine if there's a component to render
      let ComponentToRender = null;
      
      // Find all potential components that follow React component naming convention (PascalCase)
      const potentialComponents = Object.keys(window)
        .filter(key => /^[A-Z][A-Za-z0-9]*$/.test(key) && typeof window[key] === 'function');
      
      if (potentialComponents.includes('${componentName}')) {
        // If we found the component matching our expected name
        ComponentToRender = ${componentName};
      } else if (potentialComponents.length > 0) {
        // Use the first component we find with PascalCase naming
        ComponentToRender = window[potentialComponents[0]];
        console.log('Using detected component:', potentialComponents[0]);
      }
      
      if (ComponentToRender) {
        const ScrollWrapper = (props) => {
          return React.createElement('div', { 
            className: 'scroll-container', 
            style: { 
              padding: '16px', 
              boxSizing: 'border-box',
              minHeight: '100%'
            } 
          }, 
            React.createElement(ComponentToRender, props)
          );
        };
        
        ReactDOM.render(
          React.createElement(ScrollWrapper),
          document.getElementById('root')
        );
      } else {
        throw new Error('No component found to render. Make sure your code exports a component with export default.');
      }
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
  
  // Toggle pinned state for a section
  const togglePin = (section: 'prompt' | 'code' | 'preview') => {
    setPinnedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Toggle layout between horizontal and vertical
  const toggleLayout = () => {
    setLayout(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
  };

  // Focus on a specific section
  const focusSection = (section: 'prompt' | 'code' | 'preview' | null) => {
    setActiveFocus(section);
  };

  // Get section class names based on state
  const getSectionClasses = (section: 'prompt' | 'code' | 'preview') => {
    const isPinned = pinnedSections[section];
    
    // Base classes
    let classes = "transition-all duration-300 overflow-hidden rounded-lg border border-gray-200 mb-2 shadow-sm ";
    
    // For vertical layout
    if (layout === 'vertical') {
      if (activeFocus === section) {
        classes += "flex-1 min-h-[calc(100vh-220px)] ";  // Adjusted to fill available space
      } else if (activeFocus && !isPinned) {
        classes += "h-0 opacity-0 m-0 p-0 hidden ";
      } else {
        classes += "flex-1 min-h-[calc(33vh-80px)] ";  // Adjusted to give equal space when not focused
      }
    } 
    // For horizontal layout
    else {
      classes += "h-full ";
      if (activeFocus === section) {
        classes += "flex-1 min-w-[60%] ";  // Adjusted to fill available space
      } else if (activeFocus && !isPinned) {
        classes += "w-0 opacity-0 m-0 p-0 hidden ";
      } else {
        classes += "flex-1 min-w-[30%] ";  // Adjusted to give equal space when not focused
      }
    }
    
    return classes;
  };

  // Handle tab switching with preview refresh
  const handleTabChange = (tab: 'code' | 'preview') => {
    setRightPanelTab(tab);
    
    // If switching to preview tab, refresh the preview immediately
    if (tab === 'preview' && code) {
      setTimeout(() => refreshPreview(), 50);
    }
  };

  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col">
      {/* Toolbar/Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-gray-800">
            <span className="text-blue-600">MVP</span> Builder
          </h1>
          {isUsingMock && (
            <span className="ml-3 text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800">Using Mock Data</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded hover:bg-gray-100 flex items-center text-sm font-medium"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="h-4 w-4 mr-1.5" /> : <Moon className="h-4 w-4 mr-1.5" />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <a 
            href="https://github.com/your-username/mvp-builder" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-1.5 rounded hover:bg-gray-100 flex items-center text-sm font-medium"
          >
            <Github className="h-4 w-4 mr-1.5" />
            GitHub
          </a>
        </div>
      </div>
      
      {/* Main content area - split into left and right panels */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Chatbot/Prompt */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col h-full bg-white">
          <div className="py-3 px-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-md font-medium text-gray-800">Chat with AI</h2>
          </div>
          
          <div className="flex-grow overflow-auto flex flex-col">
            {/* API Key Status Notice */}
            {!(process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY) && (
              <div className="m-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
                <strong>API Key Missing:</strong> Using mock data. To use Groq API, add NEXT_PUBLIC_GROQ_API_KEY to your .env.local file and restart the server.
                <div className="mt-2 text-xs">
                  <strong>Note:</strong> The key must be prefixed with NEXT_PUBLIC_ to be accessible in browser code.
                </div>
              </div>
            )}
            
            {/* Chat Messages */}
            <div className="flex-grow overflow-y-auto p-3">
              {chatMessages.length > 0 ? (
                <div className="space-y-4">
                  {chatMessages.map((message, index) => (
                    <div 
                      key={index} 
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.type === 'user' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={(el) => { if (el) el.scrollIntoView({ behavior: 'smooth' }); }}></div>
                </div>
              ) : (
                <div className="text-center text-gray-500 my-8">
                  <p>No messages yet. Start by entering a prompt below.</p>
                </div>
              )}
            </div>
            
            {/* Chat Input */}
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <form onSubmit={handleSubmit} className="flex flex-col">
                <Textarea
                  ref={promptInputRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter your prompt here... (e.g., 'Create a button component')"
                  className="resize-none p-3 text-base rounded border-gray-300 text-gray-800 bg-white min-h-[100px]"
                  disabled={isLoading}
                />
                <button 
                  type="submit" 
                  disabled={isLoading || !prompt.trim()}
                  className={cn(
                    "mt-3 py-2 px-4 rounded text-white font-medium flex items-center justify-center",
                    isLoading || !prompt.trim() 
                      ? "bg-blue-400 cursor-not-allowed" 
                      : "bg-blue-500 hover:bg-blue-600"
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Generate Code
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
        
        {/* Right panel - Code/Preview with tabs */}
        <div className="w-2/3 flex flex-col h-full">
          {/* Tabs header */}
          <div className="flex items-center border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => handleTabChange('code')}
              className={`px-6 py-3 font-medium text-sm flex items-center border-b-2 ${
                rightPanelTab === 'code'
                  ? 'border-blue-500 text-blue-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Code className="h-4 w-4 mr-2" />
              Code
            </button>
            <button
              onClick={() => handleTabChange('preview')}
              className={`px-6 py-3 font-medium text-sm flex items-center border-b-2 ${
                rightPanelTab === 'preview'
                  ? 'border-blue-500 text-blue-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Rocket className="h-4 w-4 mr-2" />
              Preview
            </button>
            
            {/* Actions for the active panel */}
            <div className="ml-auto flex items-center pr-4">
              {rightPanelTab === 'code' && code && !isLoading && (
                <>
                  <button 
                    onClick={copyToClipboard}
                    className="p-1.5 rounded hover:bg-gray-100 ml-2 text-gray-600"
                    title="Copy code to clipboard"
                  >
                    {copySuccess ? <Check className="h-4 w-4 text-green-500" /> : <Code className="h-4 w-4" />}
                  </button>
                  {!isEditing ? (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="p-1.5 rounded hover:bg-gray-100 ml-2 text-gray-600"
                      title="Edit code"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={saveEditedCode}
                        className="p-1.5 rounded hover:bg-gray-100 text-green-600 ml-2"
                        title="Save changes"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={cancelEditing}
                        className="p-1.5 rounded hover:bg-gray-100 text-red-600 ml-2"
                        title="Cancel editing"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </>
              )}
              {rightPanelTab === 'preview' && code && !isLoading && (
                <button 
                  onClick={refreshPreview}
                  className="p-1.5 rounded hover:bg-gray-100 ml-2 text-gray-600"
                  title="Refresh preview"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          {/* Content area */}
          <div className="flex-grow overflow-hidden">
            {/* Code panel */}
            {rightPanelTab === 'code' && (
              <div className="h-full">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    <span className="ml-2 text-gray-600">Generating code...</span>
                  </div>
                ) : code ? (
                  isEditing ? (
                    <Textarea
                      value={editedCode}
                      onChange={handleCodeEdit}
                      className="w-full h-full p-4 text-sm font-mono border-0 rounded-none resize-none text-gray-800 bg-white"
                      style={{ minHeight: '100%' }}
                    />
                  ) : (
                    <pre className="p-4 m-0 rounded-none overflow-auto h-full bg-white text-sm font-mono text-gray-800 whitespace-pre-wrap">
                      <code>{code}</code>
                    </pre>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center h-full bg-white rounded text-gray-500">
                    <Code className="h-12 w-12 text-gray-300 mb-2" />
                    <p>Generate code with a prompt to see it here</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Preview panel */}
            {rightPanelTab === 'preview' && (
              <div className="h-full">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    <span className="ml-2 text-gray-600">Generating preview...</span>
                  </div>
                ) : code ? (
                  <div className="h-full w-full">
                    <CodePreview code={isEditing ? editedCode : code} darkMode={darkMode} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <Rocket className="h-12 w-12 text-gray-300 mb-2" />
                    <p>Generate code first to see the preview</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
