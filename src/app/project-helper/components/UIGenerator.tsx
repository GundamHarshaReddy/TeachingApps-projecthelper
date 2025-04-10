"use client";

import React, { useState, useEffect, useRef } from 'react';
import { LiveProvider, LiveError, LivePreview } from 'react-live';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-jsx';
import 'prismjs/themes/prism-tomorrow.css';

// Define types for our state variables
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface VersionHistory {
  code: string;
  timestamp: Date;
  prompt: string;
}

interface Settings {
  autoCompile: boolean;
  autoFormat: boolean;
  reactVersion: string;
  tailwind: boolean;
  aiModel: string;
}

const UIGenerator: React.FC = () => {
  const [code, setCode] = useState<string>(`
import React from 'react';

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 h-96">
      <div className="mb-4 p-4 rounded-full bg-blue-100">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="9" y1="3" x2="9" y2="21"></line>
          <path d="M13 8l4 4-4 4"></path>
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900">No component generated yet</h3>
      <p className="mt-2 text-sm text-gray-500">
        Enter a prompt to generate a React component using AI. Be specific about the functionality,
        design, and any special requirements.
      </p>
    </div>
  );
};

export default EmptyState;
  `.trim());
  
  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [aiConversation, setAiConversation] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('preview');
  const [componentName, setComponentName] = useState<string>('EmptyState');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [framework, setFramework] = useState<string>('react');
  const [iterations, setIterations] = useState<VersionHistory[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [settings, setSettings] = useState<Settings>({
    autoCompile: true,
    autoFormat: true,
    reactVersion: '18',
    tailwind: true,
    aiModel: 'gpt-4'
  });
  
  const promptInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [aiConversation]);
  
  useEffect(() => {
    // Check for API key in local storage or environment variables
    const storedApiKey = localStorage.getItem('aiui_api_key') || process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    localStorage.setItem('aiui_api_key', newKey);
  };

  const handleSubmitPrompt = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!prompt.trim()) return;
    
    // Add user message to conversation
    const userMessage = prompt;
    setAiConversation(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    setError(null);
    
    try {
      // Store current version before generating new code
      if (code && iterations.length === 0 || (iterations.length > 0 && code !== iterations[0]?.code)) {
        setIterations(prev => [{
          code,
          timestamp: new Date(),
          prompt: userMessage
        }, ...prev]);
      }

      let generatedCode: string;
      
      // Determine what kind of component is being generated for better naming
      let suggestedComponentName = 'GeneratedComponent';
      const promptLower = userMessage.toLowerCase();
      
      if (promptLower.includes('school') || promptLower.includes('education') || promptLower.includes('academy')) {
        suggestedComponentName = 'SchoolWebsite';
      } else if (promptLower.includes('dashboard') || promptLower.includes('analytics')) {
        suggestedComponentName = 'Dashboard';
      } else if (promptLower.includes('login') || promptLower.includes('signin')) {
        suggestedComponentName = 'LoginForm';
      } else if (promptLower.includes('card') || promptLower.includes('product')) {
        suggestedComponentName = 'ProductCard';
      } else if (promptLower.includes('navbar') || promptLower.includes('navigation')) {
        suggestedComponentName = 'Navbar';
      }
      
      if (!apiKey) {
        // Fallback to demo mode with sample components
        setAiConversation(prev => [
          ...prev, 
          { 
            role: 'assistant', 
            content: `⚠️ No API key provided. Running in demo mode with limited pre-built components. Please add your API key in settings to enable real AI generation.` 
          }
        ]);
        generatedCode = generateDemoComponent(userMessage);
      } else {
        // Make actual API call to Groq API
        generatedCode = await generateComponentWithAI(userMessage);
      }
      
      // Extract component name
      const nameMatch = generatedCode.match(/const\s+(\w+)\s*=/);
      const newComponentName = nameMatch && nameMatch[1] ? nameMatch[1] : suggestedComponentName;
      setComponentName(newComponentName);
      
      // Update code with generated version
      setCode(generatedCode);
      
      // Add AI response to conversation
      setAiConversation(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: `I've generated a ${newComponentName} component based on your description. You can see it in the preview panel and edit the code directly if needed.` 
        }
      ]);
      
      // Clear prompt input
      setPrompt('');
      
      // Focus back on input for next prompt
      promptInputRef.current?.focus();
      
    } catch (err) {
      console.error("Error generating component:", err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      setAiConversation(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: `I encountered an error while generating your component: ${err instanceof Error ? err.message : 'An unknown error occurred'}. Please try again with a different prompt.` 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const generateComponentWithAI = async (userPrompt: string): Promise<string> => {
    if (!apiKey) {
      throw new Error("API key is required to generate components with AI");
    }

    const systemPrompt = `You are an expert React developer who specializes in creating UI components with Tailwind CSS. 
    Generate a React component based on the following description. 
    The component should be functional, well-structured, and use Tailwind CSS for styling.
    Only respond with the component code, nothing else. No explanations, just the pure React component code.`;

    try {
      // Using Groq API instead of OpenAI
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Create a detailed React component for a ${userPrompt}. Use Tailwind CSS for styling. Make it realistic, professional, and feature-rich. Include realistic placeholder content that would be typical for such a website.` }
          ],
          temperature: 0.7,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to generate component');
      }

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;
      
      // Extract code from response
      let code = generatedContent;
      
      // If the code is wrapped in ```jsx and ``` code blocks, extract just the code
      const codeMatch = generatedContent.match(/```(?:jsx|javascript|js|react)?\s*([\s\S]*?)```/);
      if (codeMatch && codeMatch[1]) {
        code = codeMatch[1].trim();
      }
      
      return code;
    } catch (err) {
      console.error("Error calling Groq API:", err);
      throw err;
    }
  };

  const generateDemoComponent = (userPrompt: string): string => {
    const promptLower = userPrompt.toLowerCase();
    
    if (promptLower.includes('school') || promptLower.includes('education') || promptLower.includes('academy')) {
      return `import React, { useState } from 'react';

const SchoolWebsite = () => {
  const [activeTab, setActiveTab] = useState("home");
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="mr-3 bg-white p-2 rounded-full">
              <svg className="h-8 w-8 text-blue-900" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Willow Creek Academy</h1>
              <p className="text-sm text-blue-200">Nurturing Tomorrow's Leaders</p>
            </div>
          </div>
          
          <nav className="flex flex-wrap justify-center">
            <button 
              onClick={() => setActiveTab("home")}
              className={"px-4 py-2 font-medium " + (activeTab === "home" ? "bg-blue-800 rounded-md" : "")}
            >
              Home
            </button>
            <button 
              onClick={() => setActiveTab("about")}
              className={"px-4 py-2 font-medium " + (activeTab === "about" ? "bg-blue-800 rounded-md" : "")}
            >
              About
            </button>
            <button 
              onClick={() => setActiveTab("academics")}
              className={"px-4 py-2 font-medium " + (activeTab === "academics" ? "bg-blue-800 rounded-md" : "")}
            >
              Academics
            </button>
            <button 
              onClick={() => setActiveTab("admissions")}
              className={"px-4 py-2 font-medium " + (activeTab === "admissions" ? "bg-blue-800 rounded-md" : "")}
            >
              Admissions
            </button>
            <button 
              onClick={() => setActiveTab("contact")}
              className={"px-4 py-2 font-medium " + (activeTab === "contact" ? "bg-blue-800 rounded-md" : "")}
            >
              Contact
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-96 flex items-center">
          <div className="container mx-auto px-4 z-10">
            <div className="max-w-xl text-white">
              <h2 className="text-4xl font-bold mb-4">Welcome to Willow Creek Academy</h2>
              <p className="text-xl mb-8">Providing excellence in education for students of all backgrounds since 1995.</p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-white text-blue-800 font-bold py-3 px-6 rounded-md hover:bg-gray-100 transition duration-300">
                  Schedule a Visit
                </button>
                <button className="bg-transparent border-2 border-white text-white font-bold py-3 px-6 rounded-md hover:bg-white hover:bg-opacity-10 transition duration-300">
                  Learn More
                </button>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Choose Willow Creek Academy?</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our commitment to academic excellence and student growth sets us apart from other educational institutions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-lg shadow-md transition-transform hover:scale-105">
              <div className="bg-blue-100 text-blue-800 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Personalized Learning</h3>
              <p className="text-gray-600">
                We tailor our teaching approaches to meet the unique needs and learning styles of each student.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg shadow-md transition-transform hover:scale-105">
              <div className="bg-green-100 text-green-800 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Innovative Curriculum</h3>
              <p className="text-gray-600">
                Our forward-thinking programs prepare students for success in a rapidly changing world.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg shadow-md transition-transform hover:scale-105">
              <div className="bg-red-100 text-red-800 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Supportive Community</h3>
              <p className="text-gray-600">
                Our tight-knit community fosters collaboration, respect, and lifelong connections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* News & Events */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">News & Upcoming Events</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Stay updated with the latest happenings at Willow Creek Academy.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-blue-200"></div>
              <div className="p-6">
                <div className="text-sm text-blue-600 font-semibold mb-2">May 15, 2023</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Annual Science Fair Winners Announced</h3>
                <p className="text-gray-600 mb-4">
                  Congratulations to all participants in this year's Science Fair. The creativity and innovation displayed were truly remarkable.
                </p>
                <a href="#" className="text-blue-600 font-medium hover:underline">Read More →</a>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-green-200"></div>
              <div className="p-6">
                <div className="text-sm text-blue-600 font-semibold mb-2">June 10, 2023</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Summer Enrichment Programs Now Open</h3>
                <p className="text-gray-600 mb-4">
                  Registration is now open for our summer programs, featuring a wide range of activities from STEM to arts and humanities.
                </p>
                <a href="#" className="text-blue-600 font-medium hover:underline">Read More →</a>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-red-200"></div>
              <div className="p-6">
                <div className="text-sm text-blue-600 font-semibold mb-2">June 25, 2023</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Graduation Ceremony Details</h3>
                <p className="text-gray-600 mb-4">
                  Information regarding our upcoming graduation ceremony, including schedule, venue, and guest speaker announcements.
                </p>
                <a href="#" className="text-blue-600 font-medium hover:underline">Read More →</a>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <button className="bg-blue-600 text-white font-bold py-3 px-6 rounded-md hover:bg-blue-700 transition duration-300">
              View All News & Events
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">What Our Community Says</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Hear from our students, parents, and alumni about their experiences at Willow Creek Academy.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-gray-50 p-8 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-blue-200 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-bold text-gray-800">Sarah Johnson</h4>
                  <p className="text-sm text-gray-600">Parent of 8th Grader</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "The dedicated teachers at Willow Creek have fostered a love of learning in my daughter that I never thought possible. The supportive environment has allowed her to flourish both academically and socially."
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-green-200 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-bold text-gray-800">Michael Chen</h4>
                  <p className="text-sm text-gray-600">Alumni, Class of 2018</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "My years at Willow Creek prepared me incredibly well for college and beyond. The critical thinking skills and confidence I developed there continue to serve me in all aspects of my life."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Willow Creek Academy</h3>
              <p className="text-blue-200 mb-4">Nurturing Tomorrow's Leaders</p>
              <div className="flex space-x-4">
                <a href="#" className="text-white hover:text-blue-200">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-blue-200">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.051 10.051 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.667 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-blue-200">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.421.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.074-4.947c-.061-1.277-.256-1.805-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-blue-200 hover:text-white">Home</a></li>
                <li><a href="#" className="text-blue-200 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-blue-200 hover:text-white">Academics</a></li>
                <li><a href="#" className="text-blue-200 hover:text-white">Admissions</a></li>
                <li><a href="#" className="text-blue-200 hover:text-white">Campus Life</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Contact Us</h3>
              <address className="not-italic text-blue-200 space-y-2">
                <p>123 Academy Lane</p>
                <p>Willow Creek, CA 90210</p>
                <p>Phone: (555) 123-4567</p>
                <p>Email: info@willowcreekacademy.edu</p>
              </address>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Newsletter</h3>
              <p className="text-blue-200 mb-4">Subscribe to our newsletter to receive updates and news.</p>
              <form className="space-y-2">
                <input 
                  type="email" 
                  placeholder="Your email address"
                  className="w-full px-4 py-2 rounded-md text-gray-900"
                />
                <button 
                  type="submit"
                  className="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          
          <div className="border-t border-blue-800 mt-8 pt-8 text-center text-blue-300 text-sm">
            <p>© 2023 Willow Creek Academy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SchoolWebsite;`);
    } else if (promptLower.includes('dashboard') || promptLower.includes('analytics')) {
      return `import React from 'react';

const Dashboard = () => {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium">Total Users</h3>
          <p className="text-3xl font-bold mt-2">1,234</p>
          <p className="text-green-500 text-sm">↑ 12% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium">Revenue</h3>
          <p className="text-3xl font-bold mt-2">$12,345</p>
          <p className="text-green-500 text-sm">↑ 8% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium">Active Now</h3>
          <p className="text-3xl font-bold mt-2">56</p>
          <p className="text-gray-500 text-sm">Users online</p>
        </div>
      </div>
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex items-center p-2 rounded hover:bg-gray-50">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                <span className="text-gray-500">U{item}</span>
              </div>
              <div>
                <p className="font-medium">User {item} performed an action</p>
                <p className="text-sm text-gray-500">{item} minute{item !== 1 ? 's' : ''} ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;`;
    } else if (promptLower.includes('login') || promptLower.includes('signin') || promptLower.includes('sign in')) {
      return `import React, { useState } from 'react';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Login submitted:', { email, password, rememberMe });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              create a new account
            </a>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-blue-500 group-hover:text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </span>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;`;
    } else if (promptLower.includes('card') || promptLower.includes('product')) {
      return `import React, { useState } from 'react';

const ProductCard = () => {
  const [isInCart, setIsInCart] = useState(false);

  const handleAddToCart = () => {
    setIsInCart(!isInCart);
  };

  return (
    <div className="max-w-sm rounded-lg overflow-hidden shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
      <div className="relative">
        <img className="w-full h-64 object-cover" src="/api/placeholder/400/300" alt="Product" />
        <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 m-2 rounded">
          SALE
        </div>
      </div>
      <div className="px-6 py-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold text-xl">Wireless Headphones</h2>
          <div className="flex items-center">
            <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
            </svg>
            <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
            </svg>
            <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
            </svg>
            <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
            </svg>
            <svg className="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 20 20">
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
            </svg>
            <span className="text-gray-600 text-sm ml-1">(48)</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm line-through">$149.99</p>
            <p className="text-gray-900 text-xl font-bold">$99.99</p>
          </div>
          <p className="text-green-600 text-sm">33% off</p>
        </div>
        <p className="text-gray-700 text-sm mt-2">
          Premium wireless headphones with noise cancellation and 30-hour battery life. Includes carrying case.
        </p>
        <div className="mt-3">
          <div className="flex items-center mb-2">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
            <span className="text-sm text-green-600">In Stock</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            Free shipping
          </div>
        </div>
      </div>
      <div className="px-6 pt-2 pb-4">
        <button 
          onClick={handleAddToCart}
          className={"w-full py-2 px-4 rounded font-bold " + 
            (isInCart 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
            )
          }
        >
          {isInCart ? 'Added to Cart ✓' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;`;
    } else if (promptLower.includes('navbar') || promptLower.includes('navigation')) {
      return `import React, { useState } from 'react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold">A</div>
              <span className="ml-2 text-xl font-semibold text-gray-900">AppName</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a href="#" className="border-b-2 border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium">
                Dashboard
              </a>
              <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Team
              </a>
              <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Projects
              </a>
              <div className="relative">
                <button 
                  onClick={toggleDropdown}
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Resources
                  <svg className="ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Documentation</a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">API Reference</a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Tutorials</a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
              <span className="sr-only">View notifications</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="ml-3 relative">
              <div>
                <button className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button 
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <a href="#" className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 block pl-3 pr-4 py-2 text-base font-medium">
              Dashboard
            </a>
            <a href="#" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"><a href="#" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
              Team
            </a>
            <a href="#" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
              Projects
            </a>
            <a href="#" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
              Resources
            </a>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <svg className="h-6 w-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">Tom Cook</div>
                <div className="text-sm font-medium text-gray-500">tom@example.com</div>
              </div>
              <button className="ml-auto bg-white flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <span className="sr-only">View notifications</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            </div>
            <div className="mt-3 space-y-1">
              <a href="#" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                Your Profile
              </a>
              <a href="#" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                Settings
              </a>
              <a href="#" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                Sign out
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;`;
    } else {
      // Default component for any other prompt
      return `import React from 'react';

const GenericComponent = () => {
  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md flex items-center space-x-4">
      <div className="flex-shrink-0">
        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
          <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <div>
        <div className="text-xl font-medium text-black">Generated Component</div>
        <p className="text-gray-500">Based on your prompt: "${userPrompt}"</p>
      </div>
    </div>
  );
};

export default GenericComponent;`;
    }
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const restoreVersion = (version: VersionHistory) => {
    setCode(version.code);
    setShowHistory(false);
    setAiConversation(prev => [
      ...prev, 
      { 
        role: 'assistant', 
        content: `I've restored the version from ${new Date(version.timestamp).toLocaleString()} with prompt: "${version.prompt}"` 
      }
    ]);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  const handleHighlight = (code: string) => {
    return Prism.highlight(code, Prism.languages.jsx, 'jsx');
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <header className={`p-4 border-b ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold">AI</div>
            <h1 className="text-xl font-bold">AI React Component Generator</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-md ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
            <select 
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              className={`rounded-md border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} px-3 py-1`}
            >
              <option value="react">React</option>
              <option value="vue" disabled>Vue (Coming soon)</option>
              <option value="angular" disabled>Angular (Coming soon)</option>
            </select>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-md ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        {/* Settings Modal */}
        {showSettings && (
          <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50`}>
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-xl max-w-md w-full`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Settings</h2>
                <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">OpenAI API Key</label>
                <input 
                  type="password"
                  value={apiKey}
                  onChange={handleApiKeyChange}
                  placeholder="Enter your API key"
                  className={`w-full p-2 border rounded-md ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
                <p className="text-sm text-gray-500 mt-1">Your API key is stored locally and never sent to our servers.</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">AI Model</label>
                <select 
                  value={settings.aiModel}
                  onChange={(e) => setSettings({...settings, aiModel: e.target.value})}
                  className={`w-full p-2 border rounded-md ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                >
                  <option value="gpt-4">GPT-4 (Most capable)</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <input 
                    type="checkbox"
                    id="autoCompile"
                    checked={settings.autoCompile}
                    onChange={(e) => setSettings({...settings, autoCompile: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="autoCompile" className="ml-2 text-sm">Auto-compile code</label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox"
                    id="autoFormat"
                    checked={settings.autoFormat}
                    onChange={(e) => setSettings({...settings, autoFormat: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="autoFormat" className="ml-2 text-sm">Auto-format code</label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox"
                    id="tailwind"
                    checked={settings.tailwind}
                    onChange={(e) => setSettings({...settings, tailwind: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="tailwind" className="ml-2 text-sm">Use Tailwind CSS</label>
                </div>
              </div>
              
              <button 
                onClick={() => setShowSettings(false)}
                className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}

        {/* Version History Sidebar */}
        {showHistory && (
          <div className={`fixed inset-y-0 right-0 z-40 w-72 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-xl p-4 overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Version History</h2>
              <button onClick={() => setShowHistory(false)} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              {iterations.length === 0 ? (
                <p className="text-gray-500 text-sm">No previous versions available.</p>
              ) : (
                iterations.map((version, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-md cursor-pointer ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                    onClick={() => restoreVersion(version)}
                  >
                    <p className="font-medium truncate">{new Date(version.timestamp).toLocaleString()}</p>
                    <p className="text-sm text-gray-500 truncate">"{version.prompt}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 ${showHistory ? 'mr-72' : ''}`}>
          {/* Chat Panel */}
          <div className={`flex flex-col ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">AI Assistant</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setShowHistory(!showHistory)}
                  className={`p-1.5 rounded text-sm ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {aiConversation.length === 0 ? (
                <div className="text-center py-10">
                  <div className="mx-auto h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium">Welcome to AI UI Generator</h3>
                  <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                    Describe the UI component you want to create, and our AI will generate the code for you.
                  </p>
                </div>
              ) : (
                aiConversation.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-3/4 rounded-lg px-4 py-2 ${
                        message.role === 'user' 
                          ? `${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'} text-white` 
                          : `${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
            
            {/* Chat Input */}
            <form onSubmit={handleSubmitPrompt} className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the UI component you want to create..."
                  className={`flex-1 p-2 border rounded-md ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  ref={promptInputRef}
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className={`px-4 py-2 rounded-md bg-blue-600 text-white ${
                    loading || !prompt.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                  }`}
                >
                  {loading ? 'Generating...' : 'Generate'}
                </button>
              </div>
              {!apiKey && (
                <div className="mt-2 text-sm text-yellow-500 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Running in demo mode. Add API key in settings for full functionality.
                </div>
              )}
            </form>
          </div>
          
          {/* Code Editor and Preview Panel */}
          <div className={`flex flex-col ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden`}>
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('code')}
                className={`flex-1 py-3 font-medium ${
                  activeTab === 'code' 
                    ? `border-b-2 border-blue-500 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}` 
                    : 'text-gray-500'
                }`}
              >
                Code
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex-1 py-3 font-medium ${
                  activeTab === 'preview' 
                    ? `border-b-2 border-blue-500 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}` 
                    : 'text-gray-500'
                }`}
              >
                Preview
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden">
              {activeTab === 'code' ? (
                <div className={`h-full overflow-auto ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <Editor
                    value={code}
                    onValueChange={handleCodeChange}
                    highlight={handleHighlight}
                    padding={20}
                    style={{
                      fontFamily: '"Fira code", "Fira Mono", monospace',
                      fontSize: 14,
                      minHeight: '100%',
                      backgroundColor: theme === 'dark' ? '#1a202c' : '#f7fafc',
                      color: theme === 'dark' ? '#e2e8f0' : '#1a202c'
                    }}
                  />
                </div>
              ) : (
                <div className={`h-full overflow-auto relative ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                  <LiveProvider code={code} disabled>
                    <LiveError 
                      style={{
                        padding: '1rem', 
                        backgroundColor: '#FEE2E2', 
                        color: '#B91C1C',
                        margin: '1rem',
                        borderRadius: '0.375rem',
                        display: 'none'
                      }} 
                    />
                    <div className={`p-4 flex items-center justify-center h-full ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                      <LivePreview />
                    </div>
                  </LiveProvider>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UIGenerator;       