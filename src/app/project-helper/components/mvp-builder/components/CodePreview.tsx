"use client"

import React, { useEffect, useRef, useState } from 'react';
import { simpleBundle } from '../services/simple-bundler';

interface CodePreviewProps {
  code: string;
  className?: string;
  onError?: (error: string) => void;
  darkMode?: boolean;
}

export function CodePreview({ code, className = '', onError, darkMode = false }: CodePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);

  // Generate HTML content for the preview iframe
  const generateHtml = (scriptContent: string = '', errorMessage: string = '') => {
    const bgColor = darkMode ? '#1a202c' : 'white';
    const textColor = darkMode ? '#e2e8f0' : '#1a202c';
    const errorBgColor = darkMode ? '#2d3748' : '#fff5f5';
    
    // Clean up error message for display
    const safeErrorMessage = errorMessage 
      ? errorMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;')
      : '';
    
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React Preview</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js" crossorigin></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      margin: 0;
      padding: 16px;
      background-color: ${bgColor};
      color: ${textColor};
    }
    #root {
      width: 100%;
    }
    .error {
      color: #e53e3e;
      background-color: ${errorBgColor};
      border-left: 4px solid #e53e3e;
      padding: 12px;
      margin-bottom: 16px;
      white-space: pre-wrap;
      font-family: monospace;
    }
    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100px;
      font-size: 16px;
    }
    .fallback-notice {
      background-color: ${darkMode ? '#4A5568' : '#FFFDE7'};
      color: ${darkMode ? '#F6E05E' : '#B7791F'};
      padding: 4px 8px;
      margin-bottom: 8px;
      font-size: 12px;
      border-radius: 4px;
    }
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
      max-height: 200px;
      overflow-y: auto;
      background-color: ${darkMode ? '#2D3748' : '#f7fafc'};
      padding: 8px;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  ${isLoading ? '<div class="loading">Loading preview...</div>' : ''}
  ${safeErrorMessage ? `<div class="error">${safeErrorMessage}</div>` : ''}
  ${usedFallback && !safeErrorMessage ? '<div class="fallback-notice">Using simple bundler</div>' : ''}
  <div id="root"></div>

  <script>
    // Plain JavaScript error handler (before Babel runs)
    window.onerror = function(message, source, lineno, colno, error) {
      console.error("Global error:", message);
      document.getElementById("root").innerHTML = 
        '<div class="error">Preview error: ' + message.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</div>';
      return true; // Prevent default browser error handling
    };
  </script>

  ${scriptContent ? `<script type="text/babel" data-presets="react">
    // This will execute after Babel transforms the code
    try {
      ${scriptContent}
      
      // After code execution, render the component
      try {
        const Component = window.__PreviewComponent;
        
        if (!Component) {
          const availableFunctions = Object.keys(window)
            .filter(k => typeof window[k] === 'function' && !['React', 'ReactDOM', 'Babel', 'onerror'].includes(k))
            .join(', ');
            
          throw new Error('No React component found to render. Available functions: ' + availableFunctions);
        }
        
        if (typeof Component !== 'function') {
          throw new Error('Component must be a function. Got: ' + typeof Component);
        }
        
        console.log('Rendering component:', Component.name || 'unnamed');
        
        // Use React 18's createRoot API if available
        const rootElement = document.getElementById('root');
        if (ReactDOM.createRoot) {
          const root = ReactDOM.createRoot(rootElement);
          root.render(React.createElement(React.StrictMode, null, 
            React.createElement(Component)
          ));
        } else {
          // Fallback to older ReactDOM.render
          ReactDOM.render(
            React.createElement(React.StrictMode, null,
              React.createElement(Component)
            ),
            rootElement
          );
        }
      } catch (renderError) {
        console.error('Error rendering component:', renderError);
        document.getElementById('root').innerHTML = 
          '<div class="error">Error rendering component: ' + renderError.message.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</div>';
      }
    } catch (err) {
      console.error('Error in preview code:', err);
      document.getElementById('root').innerHTML = 
        '<div class="error">Error in preview code: ' + err.message.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</div>';
    }
  </script>` : ''}
</body>
</html>`;
  };

  useEffect(() => {
    let isMounted = true;
    
    const runCode = async () => {
      if (!iframeRef.current) return;
      
      try {
        // Set initial loading state
        setIsLoading(true);
        setError(null);
        setUsedFallback(false);
        
        iframeRef.current.srcdoc = generateHtml();
        
        // Print original code for debugging (truncated for large code)
        console.log('Original code:', code.length > 150 ? code.substring(0, 150) + '...' : code);
        
        // Process with simple bundler
        console.log('Using simple bundler for code preview...');
        const result = await simpleBundle(code);
        setUsedFallback(true);
        
        if (!isMounted) return;
        
        if (result.error) {
          console.error('Bundling error:', result.error);
          setError(result.error);
          if (onError) onError(result.error);
          
          // Update iframe with error
          iframeRef.current.srcdoc = generateHtml('', result.error);
          return;
        }
        
        // Update iframe with bundled code
        console.log('Setting up preview with bundled code');
        iframeRef.current.srcdoc = generateHtml(result.code);
      } catch (err: unknown) {
        console.error('Preview error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error in code preview';
        setError(errorMessage);
        if (onError) onError(errorMessage);
        
        // Update iframe with error
        if (iframeRef.current) {
          iframeRef.current.srcdoc = generateHtml('', errorMessage);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    // Run the code if it exists
    if (code) {
      runCode();
    } else {
      setIsLoading(false);
      setError(null);
      if (iframeRef.current) {
        iframeRef.current.srcdoc = generateHtml('', 'No code provided.');
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, [code, onError, darkMode]);

  return (
    <div className={`relative h-full w-full overflow-hidden rounded-md ${className}`}>
      <iframe
        ref={iframeRef}
        title="Code Preview"
        className="h-full w-full border-0"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}

export default CodePreview; 