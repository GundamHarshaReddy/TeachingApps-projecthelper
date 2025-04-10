"use client"

import React, { useState } from 'react'

interface Feature {
  id: string
  name: string
  description: string
  priority: 'low' | 'medium' | 'high'
  complexity: 'simple' | 'moderate' | 'complex'
  aiGenerated?: boolean
}

interface ProjectData {
  name: string
  description: string
  techStack: string[]
  features: Feature[]
}

interface PreviewProps {
  projectData: ProjectData
  onBack: () => void
}

export default function Preview({ projectData, onBack }: PreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')
  const [activeTab, setActiveTab] = useState<'summary' | 'architecture' | 'code'>('summary')
  
  // Calculate estimated time and cost
  const getComplexityWeight = (complexity: string): number => {
    switch (complexity) {
      case 'simple': return 1
      case 'moderate': return 2
      case 'complex': return 4
      default: return 0
    }
  }
  
  const calculateEstimates = () => {
    const totalComplexity = projectData.features.reduce(
      (sum, feature) => sum + getComplexityWeight(feature.complexity), 
      0
    )
    
    const timeEstimate = {
      min: totalComplexity * 0.5, // days
      max: totalComplexity * 1.5  // days
    }
    
    const costEstimate = {
      min: totalComplexity * 500,  // dollars
      max: totalComplexity * 1500  // dollars
    }
    
    return { timeEstimate, costEstimate }
  }
  
  const { timeEstimate, costEstimate } = calculateEstimates()
  
  const generateMVPCode = async () => {
    setIsGenerating(true)
    
    try {
      // In a real implementation, this would call your Groq API
      // For now, we'll simulate with a timeout and sample code
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const sampleCode = `// Generated MVP Starter Code for ${projectData.name}
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './styles.css';

// Main App Component
function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

// Header Component
function Header() {
  return (
    <header className="header">
      <div className="logo">
        <h1>${projectData.name}</h1>
      </div>
      <nav className="nav">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/profile">Profile</Link></li>
        </ul>
      </nav>
      <div className="auth-buttons">
        <button className="login-btn">Log In</button>
        <button className="signup-btn">Sign Up</button>
      </div>
    </header>
  );
}

// Home Component
function Home() {
  return (
    <div className="home">
      <section className="hero">
        <h2>Welcome to ${projectData.name}</h2>
        <p>${projectData.description}</p>
        <button className="cta-btn">Get Started</button>
      </section>
      <section className="features">
        <h3>Key Features</h3>
        <div className="feature-grid">
          ${projectData.features.map(feature => `
          <div className="feature-card">
            <h4>${feature.name}</h4>
            <p>${feature.description}</p>
          </div>`).join('')}
        </div>
      </section>
    </div>
  );
}

// Dashboard Component
function Dashboard() {
  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Analytics</h3>
          <div className="chart-placeholder"></div>
        </div>
        <div className="dashboard-card">
          <h3>Recent Activity</h3>
          <ul className="activity-list">
            <li>Activity item 1</li>
            <li>Activity item 2</li>
            <li>Activity item 3</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Profile Component
function Profile() {
  return (
    <div className="profile">
      <h2>User Profile</h2>
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar"></div>
          <div className="profile-info">
            <h3>John Doe</h3>
            <p>john.doe@example.com</p>
          </div>
        </div>
        <div className="profile-details">
          <h4>Account Details</h4>
          <form className="profile-form">
            <div className="form-group">
              <label>Name</label>
              <input type="text" value="John Doe" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value="john.doe@example.com" />
            </div>
            <button type="submit">Update Profile</button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">
          <h3>${projectData.name}</h3>
        </div>
        <div className="footer-links">
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} ${projectData.name}. All rights reserved.</p>
      </div>
    </footer>
  );
}

// Render the App
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);`;
      
      setGeneratedCode(sampleCode)
      setActiveTab('code')
    } catch (error) {
      console.error('Error generating MVP code:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Preview & Export</h2>
      
      <div className="border border-gray-200 rounded-md overflow-hidden mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex px-4 -mb-px">
            <button
              onClick={() => setActiveTab('summary')}
              className={`whitespace-nowrap py-4 px-4 font-medium text-sm ${
                activeTab === 'summary'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Project Summary
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`whitespace-nowrap py-4 px-4 font-medium text-sm ${
                activeTab === 'architecture'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Architecture
            </button>
            {generatedCode && (
              <button
                onClick={() => setActiveTab('code')}
                className={`whitespace-nowrap py-4 px-4 font-medium text-sm ${
                  activeTab === 'code'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Generated Code
              </button>
            )}
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Project Information</h3>
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Project Name</p>
                      <p className="font-medium">{projectData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tech Stack</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {projectData.techStack.map(tech => (
                          <span key={tech} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500">Description</p>
                      <p>{projectData.description}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Features ({projectData.features.length})</h3>
                <div className="space-y-4">
                  {projectData.features.map((feature) => (
                    <div key={feature.id} className="bg-gray-50 p-4 rounded border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{feature.name}</h4>
                        <div className="flex gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            feature.priority === 'high' 
                              ? 'bg-red-100 text-red-800' 
                              : feature.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                          }`}>
                            {feature.priority.charAt(0).toUpperCase() + feature.priority.slice(1)}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {feature.complexity.charAt(0).toUpperCase() + feature.complexity.slice(1)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Estimates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded border border-gray-200">
                    <h4 className="font-medium mb-2">Development Time</h4>
                    <p className="text-2xl font-bold text-gray-900">
                      {timeEstimate.min.toFixed(1)} - {timeEstimate.max.toFixed(1)} days
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Based on feature complexity</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded border border-gray-200">
                    <h4 className="font-medium mb-2">Estimated Cost</h4>
                    <p className="text-2xl font-bold text-gray-900">
                      ${costEstimate.min.toLocaleString()} - ${costEstimate.max.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Based on average developer rates</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Architecture</h3>
                <div className="bg-gray-50 p-6 rounded border border-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                      <div className="w-40 p-4 bg-blue-100 rounded-lg border border-blue-200 text-center">
                        <div className="font-medium">Frontend</div>
                        <div className="text-sm mt-2">
                          {projectData.techStack.filter(tech => 
                            ['React', 'Next.js', 'Vue', 'Angular', 'Svelte', 'JavaScript', 'TypeScript', 'Tailwind CSS'].includes(tech)
                          ).join(', ') || 'React, TypeScript'}
                        </div>
                      </div>
                      
                      <div className="text-gray-400">→</div>
                      
                      <div className="w-40 p-4 bg-purple-100 rounded-lg border border-purple-200 text-center">
                        <div className="font-medium">Backend</div>
                        <div className="text-sm mt-2">
                          {projectData.techStack.filter(tech => 
                            ['Node.js', 'Express', 'Django', 'Flask', 'Ruby on Rails', 'Spring Boot'].includes(tech)
                          ).join(', ') || 'Node.js, Express'}
                        </div>
                      </div>
                      
                      <div className="text-gray-400">→</div>
                      
                      <div className="w-40 p-4 bg-green-100 rounded-lg border border-green-200 text-center">
                        <div className="font-medium">Database</div>
                        <div className="text-sm mt-2">
                          {projectData.techStack.filter(tech => 
                            ['MongoDB', 'PostgreSQL', 'MySQL', 'Firebase', 'Supabase', 'Prisma'].includes(tech)
                          ).join(', ') || 'MongoDB'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8 flex flex-col md:flex-row gap-4 md:gap-8 justify-center">
                      <div className="w-40 p-4 bg-yellow-100 rounded-lg border border-yellow-200 text-center">
                        <div className="font-medium">Auth</div>
                        <div className="text-sm mt-2">JWT, OAuth2</div>
                      </div>
                      
                      <div className="w-40 p-4 bg-red-100 rounded-lg border border-red-200 text-center">
                        <div className="font-medium">AI Services</div>
                        <div className="text-sm mt-2">
                          {projectData.techStack.filter(tech => 
                            ['Groq', 'OpenAI', 'Hugging Face'].includes(tech)
                          ).join(', ') || 'Groq API'}
                        </div>
                      </div>
                      
                      <div className="w-40 p-4 bg-indigo-100 rounded-lg border border-indigo-200 text-center">
                        <div className="font-medium">Deployment</div>
                        <div className="text-sm mt-2">
                          {projectData.techStack.filter(tech => 
                            ['Vercel', 'Netlify', 'AWS', 'Heroku', 'Digital Ocean'].includes(tech)
                          ).join(', ') || 'Vercel'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Data Flow</h3>
                <div className="bg-gray-50 p-6 rounded border border-gray-200">
                  <ol className="relative border-l border-gray-300 ml-3">
                    <li className="mb-6 ml-6">
                      <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-gray-50">
                        <span className="text-blue-800 text-sm font-bold">1</span>
                      </span>
                      <h4 className="font-medium text-gray-900">User Interaction</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        User interacts with the frontend application, triggering API requests to the backend.
                      </p>
                    </li>
                    <li className="mb-6 ml-6">
                      <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-gray-50">
                        <span className="text-blue-800 text-sm font-bold">2</span>
                      </span>
                      <h4 className="font-medium text-gray-900">API Processing</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Backend validates requests, processes data, and handles business logic.
                      </p>
                    </li>
                    <li className="mb-6 ml-6">
                      <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-gray-50">
                        <span className="text-blue-800 text-sm font-bold">3</span>
                      </span>
                      <h4 className="font-medium text-gray-900">Database Operations</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Data is stored, retrieved, or updated in the database as needed.
                      </p>
                    </li>
                    <li className="mb-6 ml-6">
                      <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-gray-50">
                        <span className="text-blue-800 text-sm font-bold">4</span>
                      </span>
                      <h4 className="font-medium text-gray-900">AI Processing</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        For AI-powered features, Groq API is called to process data and generate insights.
                      </p>
                    </li>
                    <li className="ml-6">
                      <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-gray-50">
                        <span className="text-blue-800 text-sm font-bold">5</span>
                      </span>
                      <h4 className="font-medium text-gray-900">Response Rendering</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Results are returned to the frontend and displayed to the user.
                      </p>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'code' && generatedCode && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Generated Starter Code</h3>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(generatedCode)
                  }}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700"
                >
                  Copy Code
                </button>
              </div>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto max-h-96">
                <pre className="text-sm">
                  <code>{generatedCode}</code>
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Back to Features
        </button>
        
        {!generatedCode ? (
          <button
            onClick={generateMVPCode}
            disabled={isGenerating}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              isGenerating ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isGenerating ? 'Generating...' : 'Generate MVP Code'}
          </button>
        ) : (
          <button
            onClick={() => window.open('/mvp-builder/download', '_blank')}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md"
          >
            Export Project
          </button>
        )}
      </div>
    </div>
  )
}
