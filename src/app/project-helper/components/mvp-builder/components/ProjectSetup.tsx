"use client"

import React, { useState } from 'react'

interface ProjectData {
  name: string
  description: string
  techStack: string[]
  features: any[]
}

interface ProjectSetupProps {
  projectData: ProjectData
  setProjectData: React.Dispatch<React.SetStateAction<ProjectData>>
  onNext: () => void
}

export default function ProjectSetup({
  projectData,
  setProjectData,
  onNext,
}: ProjectSetupProps) {
  const [techInput, setTechInput] = useState('')
  
  const techOptions = [
    'Next.js', 'React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 
    'Groq', 'OpenAI', 'Node.js', 'Express', 'MongoDB',
    'Firebase', 'PostgreSQL', 'Prisma', 'Supabase', 'Vercel'
  ]
  
  const handleAddTech = (tech: string) => {
    if (!projectData.techStack.includes(tech)) {
      setProjectData({
        ...projectData,
        techStack: [...projectData.techStack, tech]
      })
    }
    setTechInput('')
  }
  
  const handleRemoveTech = (tech: string) => {
    setProjectData({
      ...projectData,
      techStack: projectData.techStack.filter(t => t !== tech)
    })
  }

  const isNextDisabled = !projectData.name || !projectData.description || projectData.techStack.length === 0

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Setup</h2>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 mb-1">
            Project Name
          </label>
          <input
            id="project-name"
            type="text"
            value={projectData.name}
            onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="My Awesome MVP"
          />
        </div>
        
        <div>
          <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 mb-1">
            Project Description
          </label>
          <textarea
            id="project-description"
            value={projectData.description}
            onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe what your MVP will do and who it's for..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tech Stack
          </label>
          
          <div className="mb-3">
            <div className="flex flex-wrap gap-2 mb-3">
              {projectData.techStack.map((tech) => (
                <div 
                  key={tech} 
                  className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
                >
                  {tech}
                  <button 
                    onClick={() => handleRemoveTech(tech)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add technology"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && techInput.trim()) {
                    e.preventDefault()
                    handleAddTech(techInput.trim())
                  }
                }}
              />
              <button
                onClick={() => techInput.trim() && handleAddTech(techInput.trim())}
                className="bg-gray-100 px-3 py-2 rounded-r-md border border-l-0 border-gray-300 text-gray-700 hover:bg-gray-200"
              >
                Add
              </button>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-2">Suggested technologies:</p>
            <div className="flex flex-wrap gap-2">
              {techOptions.filter(tech => !projectData.techStack.includes(tech)).map((tech) => (
                <button
                  key={tech}
                  onClick={() => handleAddTech(tech)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm px-3 py-1 rounded-md"
                >
                  {tech}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-end">
        <button
          onClick={onNext}
          disabled={isNextDisabled}
          className={`px-4 py-2 rounded-md text-white font-medium ${
            isNextDisabled 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          Continue to Features
        </button>
      </div>
    </div>
  )
}
