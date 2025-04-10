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

interface FeatureBuilderProps {
  projectData: ProjectData
  setProjectData: React.Dispatch<React.SetStateAction<ProjectData>>
  onNext: () => void
  onBack: () => void
}

export default function FeatureBuilder({
  projectData,
  setProjectData,
  onNext,
  onBack,
}: FeatureBuilderProps) {
  const [featureInput, setFeatureInput] = useState<Feature>({
    id: '',
    name: '',
    description: '',
    priority: 'medium',
    complexity: 'moderate'
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  
  const handleAddFeature = () => {
    const newFeature = {
      ...featureInput,
      id: Date.now().toString()
    }
    
    setProjectData({
      ...projectData,
      features: [...projectData.features, newFeature]
    })
    
    setFeatureInput({
      id: '',
      name: '',
      description: '',
      priority: 'medium',
      complexity: 'moderate'
    })
  }
  
  const handleUpdateFeature = () => {
    if (!editingId) return
    
    setProjectData({
      ...projectData,
      features: projectData.features.map(feature => 
        feature.id === editingId ? { ...featureInput } : feature
      )
    })
    
    setFeatureInput({
      id: '',
      name: '',
      description: '',
      priority: 'medium',
      complexity: 'moderate'
    })
    
    setEditingId(null)
  }
  
  const handleEditFeature = (feature: Feature) => {
    setFeatureInput(feature)
    setEditingId(feature.id)
  }
  
  const handleDeleteFeature = (id: string) => {
    setProjectData({
      ...projectData,
      features: projectData.features.filter(feature => feature.id !== id)
    })
    
    if (editingId === id) {
      setEditingId(null)
      setFeatureInput({
        id: '',
        name: '',
        description: '',
        priority: 'medium',
        complexity: 'moderate'
      })
    }
  }
  
  const handleCancelEdit = () => {
    setEditingId(null)
    setFeatureInput({
      id: '',
      name: '',
      description: '',
      priority: 'medium',
      complexity: 'moderate'
    })
  }
  
  const generateFeaturesWithAI = async () => {
    if (!projectData.description) return
    
    setIsGenerating(true)
    
    try {
      // In a real implementation, this would call your Groq API
      // For now, we'll simulate with a timeout and sample features
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const aiFeatures: Feature[] = [
        {
          id: 'ai-1-' + Date.now(),
          name: 'User Authentication',
          description: 'Allow users to register, login, and manage their profiles with secure authentication.',
          priority: 'high',
          complexity: 'moderate',
          aiGenerated: true
        },
        {
          id: 'ai-2-' + Date.now(),
          name: 'Dashboard Analytics',
          description: 'Provide users with visual analytics of their activity and progress within the platform.',
          priority: 'medium',
          complexity: 'complex',
          aiGenerated: true
        },
        {
          id: 'ai-3-' + Date.now(),
          name: 'Responsive Design',
          description: 'Ensure the application works seamlessly across desktop, tablet, and mobile devices.',
          priority: 'high',
          complexity: 'moderate',
          aiGenerated: true
        }
      ]
      
      setProjectData({
        ...projectData,
        features: [...projectData.features, ...aiFeatures]
      })
    } catch (error) {
      console.error('Error generating features:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Feature Builder</h2>
      
      <div className="mb-8">
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Project Information</h3>
            <button
              onClick={onBack}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Edit Project
            </button>
          </div>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Name:</span> {projectData.name}
            </p>
            <p>
              <span className="font-medium">Description:</span> {projectData.description}
            </p>
            <div>
              <span className="font-medium">Tech Stack:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {projectData.techStack.map(tech => (
                  <span key={tech} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden mb-8">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="font-medium">Add Feature</h3>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="feature-name" className="block text-sm font-medium text-gray-700 mb-1">
                Feature Name
              </label>
              <input
                id="feature-name"
                type="text"
                value={featureInput.name}
                onChange={(e) => setFeatureInput({ ...featureInput, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., User Authentication"
              />
            </div>
            
            <div>
              <label htmlFor="feature-description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="feature-description"
                value={featureInput.description}
                onChange={(e) => setFeatureInput({ ...featureInput, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe what this feature does and why it's important..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={featureInput.priority}
                  onChange={(e) => setFeatureInput({ 
                    ...featureInput, 
                    priority: e.target.value as 'low' | 'medium' | 'high' 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complexity
                </label>
                <select
                  value={featureInput.complexity}
                  onChange={(e) => setFeatureInput({ 
                    ...featureInput, 
                    complexity: e.target.value as 'simple' | 'moderate' | 'complex' 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="simple">Simple</option>
                  <option value="moderate">Moderate</option>
                  <option value="complex">Complex</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end space-x-2">
            {editingId ? (
              <>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateFeature}
                  disabled={!featureInput.name || !featureInput.description}
                  className={`px-4 py-2 rounded-md text-white font-medium ${
                    !featureInput.name || !featureInput.description
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Update Feature
                </button>
              </>
            ) : (
              <button
                onClick={handleAddFeature}
                disabled={!featureInput.name || !featureInput.description}
                className={`px-4 py-2 rounded-md text-white font-medium ${
                  !featureInput.name || !featureInput.description
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Add Feature
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Features List</h3>
          <button
            onClick={generateFeaturesWithAI}
            disabled={isGenerating}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-white font-medium ${
              isGenerating ? 'bg-gray-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {isGenerating ? (
              <span>Generating...</span>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                <span>Generate with AI</span>
              </>
            )}
          </button>
        </div>
        
        {projectData.features.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-gray-500">No features added yet. Add features manually or generate with AI.</p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {projectData.features.map((feature) => (
                <li key={feature.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="font-medium text-gray-900">{feature.name}</h4>
                        {feature.aiGenerated && (
                          <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                            AI Generated
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{feature.description}</p>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          feature.priority === 'high' 
                            ? 'bg-red-100 text-red-800' 
                            : feature.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {feature.priority.charAt(0).toUpperCase() + feature.priority.slice(1)} Priority
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {feature.complexity.charAt(0).toUpperCase() + feature.complexity.slice(1)} Complexity
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                      <button
                        onClick={() => handleEditFeature(feature)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteFeature(feature.id)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={projectData.features.length === 0}
          className={`px-4 py-2 rounded-md text-white font-medium ${
            projectData.features.length === 0
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          Continue to Preview
        </button>
      </div>
    </div>
  )
}
