"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Github, RefreshCw } from "lucide-react";
import { useTheme } from "next-themes";
import { useFileStore } from "../store/files";

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { resetToDefaultFiles } = useFileStore();

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleReset = () => {
    if (window.confirm("Reset all code to default examples?")) {
      resetToDefaultFiles();
    }
  };

  return (
    <header className="py-4 border-b border-slate-200 mb-6">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold">
            <span className="text-blue-600">Groq</span> React Playground
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={handleReset}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center text-xs"
            title="Reset code"
          >
            <RefreshCw size={16} className="mr-1" />
            <span>Reset</span>
          </button>
          
          <a
            href="https://github.com/yourusername/ai-playground"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Github size={20} />
            <span className="sr-only">GitHub</span>
          </a>
          
          <button
            onClick={() => toggleTheme()}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
            aria-label="Toggle theme"
          >
            {mounted && theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
} 