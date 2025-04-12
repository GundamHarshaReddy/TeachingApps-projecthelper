"use client";

import { useState } from "react";
import { updateCodeWithAI } from "../lib/ai";
import { useFileStore } from "../store/files";
import { Loader2, SendIcon } from "lucide-react";

export default function PromptInput() {
  const [prompt, setPrompt] = useState("");
  const { files, setFiles, isLoading, setLoading } = useFileStore();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedFiles = await updateCodeWithAI(prompt, files);
      setFiles(updatedFiles);
      setPrompt("");
    } catch (err: any) {
      setError(err.message || "Failed to update code with AI");
      console.error("Error updating code:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mb-6">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask Groq AI to modify your code (e.g., 'Add a counter button to the App')"
            className="w-full min-h-[80px] p-4 pr-12 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send prompt"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <SendIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        
        {error && (
          <div className="p-3 text-sm bg-red-50 text-red-600 rounded-md border border-red-200">
            {error}
          </div>
        )}
      </form>
    </div>
  );
} 