"use client";

import { Suspense, useState, useEffect } from 'react';
import Header from './components/Header';
import dynamic from 'next/dynamic';

// Dynamic imports to avoid hydration issues with client components
const PromptInput = dynamic(() => import('./components/PromptInput'), {
  ssr: false,
  loading: () => <div className="w-full h-20 bg-slate-100 animate-pulse rounded-md"></div>
});

const Editor = dynamic(() => import('./components/Editor'), {
  ssr: false,
  loading: () => <div className="w-full h-[650px] bg-slate-100 animate-pulse rounded-md"></div>
});

export default function PlaygroundPage() {
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Mark as loaded after initial render
  useEffect(() => {
    setLoaded(true);
  }, []);

  // Handle potential errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Playground error:', event.error);
      setError('An error occurred while loading the playground. Try refreshing the page.');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50">
      <div className="container mx-auto px-4 py-4">
        <Header />
        
        <main className="mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Groq AI-Powered React Playground</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Edit the code or use Groq AI to modify it.
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
              <p>Preview appears on the right side of the editor →</p>
              <p className="mt-1 text-xs text-yellow-700">Note: Use App.jsx (not App.js)</p>
            </div>
          </div>
          
          {error ? (
            <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-md text-red-600">
              {error}
            </div>
          ) : null}
          
          <div className="mb-4">
            <Suspense fallback={<div className="w-full h-20 bg-slate-100 animate-pulse rounded-md"></div>}>
              <PromptInput />
            </Suspense>
          </div>
          
          <div className="w-full h-[650px]" style={{ maxHeight: 'calc(100vh - 240px)' }}>
            <Suspense fallback={<div className="w-full h-full bg-slate-100 animate-pulse rounded-md"></div>}>
              <Editor key={loaded ? 'loaded-editor' : 'loading-editor'} />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
} 