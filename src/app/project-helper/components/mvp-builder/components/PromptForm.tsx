"use client"

import React from 'react';
import { Button } from '@/app/project-helper/components/ui/button';
import { Textarea } from '@/app/project-helper/components/ui/textarea';
import { cn } from '@/app/project-helper/lib/utils';
import LoadingDots from '@/app/project-helper/components/ui/loading-dots';

interface PromptFormProps {
  onSubmit: (values: {prompt: string}) => void;
  isLoading: boolean;
  darkMode?: boolean;
  defaultValue?: string;
}

export default function PromptForm({ onSubmit, isLoading, darkMode = false, defaultValue = '' }: PromptFormProps) {
  const [prompt, setPrompt] = React.useState(defaultValue);
  const [error, setError] = React.useState('');

  // Handle the form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (prompt.trim().length < 5) {
      setError('Prompt must be at least 5 characters.');
      return;
    }
    
    setError('');
    onSubmit({ prompt });
  };

  return (
    <div className={cn(
      "rounded-xl border shadow-lg",
      darkMode 
        ? "bg-gray-900 border-gray-800 text-gray-100" 
        : "bg-white border-gray-200 text-gray-900"
    )}>
      <div className="p-1">
        <div className={cn(
          "rounded-t-lg py-4 px-6 flex items-center",
          darkMode ? "bg-gray-800" : "bg-gray-50"
        )}>
          <div className="flex space-x-2 mr-3">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <h3 className={cn(
            "font-medium",
            darkMode ? "text-gray-300" : "text-gray-700"
          )}>Create Component</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div>
            <div className="relative">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your component... (e.g., A button with hover effects, a responsive navbar, a user profile card)"
                className={cn(
                  "min-h-[200px] text-base resize-none p-5 rounded-xl",
                  darkMode 
                    ? "bg-gray-800 border-gray-700 placeholder:text-gray-500" 
                    : "bg-gray-50 border-gray-300 placeholder:text-gray-400",
                  error ? "border-red-500 focus-visible:ring-red-500" : ""
                )}
                disabled={isLoading}
              />
              {isLoading && (
                <div className={cn(
                  "absolute inset-0 flex items-center justify-center rounded-xl",
                  darkMode ? "bg-gray-800/80" : "bg-gray-50/80"
                )}>
                  <div className={cn(
                    "flex flex-col items-center gap-3 px-5 py-4 rounded-lg",
                    darkMode ? "bg-gray-900/90" : "bg-white/90"
                  )}>
                    <LoadingDots color={darkMode ? "#4B9EFF" : "#3B82F6"} size="large" />
                    <p className="font-medium">Generating your component...</p>
                  </div>
                </div>
              )}
            </div>
            {error && <p className="mt-2 text-sm font-medium text-red-500">{error}</p>}
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center">
              <span className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                darkMode ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-600"
              )}>
                {isLoading ? "Processing..." : "AI-Powered"}
              </span>
            </div>
            <Button 
              type="submit" 
              disabled={isLoading || prompt.trim().length < 5}
              className={cn(
                "h-12 px-8 text-base font-medium rounded-xl transition-all",
                darkMode 
                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
                  : "bg-blue-600 hover:bg-blue-700 text-white",
                "transform hover:translate-y-[-2px] active:translate-y-[1px] disabled:translate-y-0"
              )}
            >
              {!isLoading && (
                <svg 
                  className="w-5 h-5 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13 10V3L4 14h7v7l9-11h-7z" 
                  />
                </svg>
              )}
              {isLoading ? (
                "Generating..."
              ) : (
                'Generate Component'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 