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
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Generate HTML content for the preview iframe
  const generateHtml = (scriptContent: string = '', errorMessage: string | Error | unknown = '') => {
    const bgColor = darkMode ? '#1a202c' : 'white';
    const textColor = darkMode ? '#e2e8f0' : '#1a202c';
    const errorBgColor = darkMode ? '#2d3748' : '#fff5f5';
    
    // Ensure errorMessage is a string before calling replace
    const safeErrorMessage = errorMessage 
      ? (typeof errorMessage === 'string' 
          ? errorMessage 
          : errorMessage instanceof Error 
            ? errorMessage.message 
            : String(errorMessage)
        ).replace(/</g, '&lt;').replace(/>/g, '&gt;')
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
    html, body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      margin: 0;
      padding: 0;
      height: 100%;
      width: 100%;
      background-color: ${bgColor};
      color: ${textColor};
      overflow: auto;
    }
    #root {
      width: 100%;
      height: 100%;
      overflow: auto;
      padding: 16px;
    }
    .error {
      color: #e53e3e;
      background-color: ${errorBgColor};
      border-left: 4px solid #e53e3e;
      padding: 12px;
      margin-bottom: 16px;
      white-space: pre-wrap;
      font-family: monospace;
      overflow-x: auto;
      max-height: 200px;
      overflow-y: auto;
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
    .import-error {
      margin-top: 8px;
      border-left: 4px solid #d69e2e;
      background-color: ${darkMode ? '#4A5568' : '#FEFCBF'};
      color: ${darkMode ? '#F6E05E' : '#8B6D35'};
      padding: 8px;
      font-size: 12px;
      border-radius: 0 4px 4px 0;
    }
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
      top: -8px;
      left: 8px;
      background: ${bgColor};
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
  ${isLoading ? '<div class="loading">Loading preview...</div>' : ''}
  ${safeErrorMessage ? `<div class="error">${safeErrorMessage}</div>` : ''}
  ${usedFallback && !safeErrorMessage ? '<div class="fallback-notice">Using simple bundler</div>' : ''}
  <div id="root"></div>

  <script>
    // Global error handler
    window.onerror = function(message, source, lineno, colno, error) {
      console.error("Global error:", message, error);
      // Get the stack trace if available
      const stack = error && error.stack ? 
        '<pre>' + error.stack.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre>' : '';
      
      document.getElementById("root").innerHTML = 
        '<div class="error">Preview error: ' + message.replace(/</g, '&lt;').replace(/>/g, '&gt;') + 
        (lineno ? '<br>Line: ' + lineno + (colno ? ':' + colno : '') : '') +
        stack + '</div>';
      
      // If the error mentions missing modules, add a helpful notice
      if (message.includes('is not defined') || message.includes('Cannot find')) {
        const missing = message.match(/(['"])([^'"]+)(['"])/);
        const missingModule = missing && missing[2] ? missing[2] : 'a module';
        
        document.getElementById("root").innerHTML += 
          '<div class="import-error">It looks like the code is trying to use ' + missingModule + 
          ' which cannot be loaded in the preview environment. External dependencies are mocked in the preview.</div>';
      }
      
      return true; // Prevents the error from being reported to the console again
    };
    
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Add to the error display if it exists
      const errorElement = document.querySelector('.error');
      if (errorElement) {
        errorElement.innerHTML += '<br><br>Unhandled Promise Rejection: ' + 
          String(event.reason).replace(/</g, '&lt;').replace(/>/g, '&gt;');
      } else {
        document.getElementById("root").innerHTML = 
          '<div class="error">Unhandled Promise Rejection: ' + 
          String(event.reason).replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</div>';
      }
    });
  </script>

  ${scriptContent ? `<script type="text/babel">
    // Execute the bundled code directly (no try/catch wrapper here)
    ${scriptContent}
    
    // After code execution, render the component
    try {
      // Get the component from the global __PreviewComponent property
      const Component = window.__PreviewComponent;
      
      if (!Component) {
        const availableFunctions = Object.keys(window)
          .filter(k => typeof window[k] === 'function' && !['React', 'ReactDOM', 'Babel', 'onerror'].includes(k))
          .join(', ');
          
        throw new Error('No component found to render. Available functions: ' + availableFunctions);
      }
      
      if (typeof Component !== 'function') {
        throw new Error('Component must be a function. Got: ' + typeof Component);
      }
      
      // Render the component with scroll wrapper
      console.log('Rendering component:', Component.name || 'unnamed');
      const rootElement = document.getElementById('root');
      
      const ScrollWrapper = (props) => {
        return React.createElement('div', { className: 'scroll-container' }, 
          React.createElement(Component, props)
        );
      };
      
      if (ReactDOM.createRoot) {
        const root = ReactDOM.createRoot(rootElement);
        root.render(React.createElement(React.StrictMode, null, 
          React.createElement(ScrollWrapper)
        ));
      } else {
        ReactDOM.render(
          React.createElement(React.StrictMode, null,
            React.createElement(ScrollWrapper)
          ),
          rootElement
        );
      }
    } catch (err) {
      console.error('Error rendering component:', err);
      document.getElementById('root').innerHTML = 
        '<div class="error">Error rendering component: ' + err.message.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</div>';
      
      // Add the stack trace if available
      if (err.stack) {
        document.getElementById('root').innerHTML += 
          '<pre class="error">' + err.stack.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre>';
      }
    }
  </script>` : ''}
</body>
</html>`;
  };

  const handleIframeLoad = () => {
    console.log('iframe loaded');
    setIframeLoaded(true);
    setIsLoading(false);
  };

  useEffect(() => {
    // Reset loading state when code changes
    setIsLoading(true);
    setIframeLoaded(false);
    
    let isMounted = true;
    
    const runCode = async () => {
      if (!iframeRef.current) return;
      
      try {
        // Set initial loading state
        setError(null);
        setUsedFallback(false);
        
        iframeRef.current.srcdoc = generateHtml();
        
        // Skip empty code
        if (!code || code.trim() === '') {
          setIsLoading(false);
          return;
        }
        
        // Clean the code to remove any surrounding backticks (in case they weren't caught earlier)
        const cleanedCode = code.replace(/^```[\w]*\n/, '').replace(/```$/, '').trim();
        
        // Print original code for debugging (truncated for large code)
        console.log('Original code:', cleanedCode.length > 150 ? cleanedCode.substring(0, 150) + '...' : cleanedCode);
        
        // Process with simple bundler
        console.log('Using simple bundler for code preview...');
        const result = await simpleBundle(cleanedCode);
        setUsedFallback(true);
        
        if (!isMounted) return;
        
        if (result.error) {
          console.error('Bundling error:', result.error);
          setError(result.error);
          if (onError) onError(result.error);
          
          // Update iframe with error - pass the error string directly
          iframeRef.current.srcdoc = generateHtml('', result.error);
          return;
        }
        
        // Update iframe with bundled code
        console.log('Setting up preview with bundled code');
        iframeRef.current.srcdoc = generateHtml(result.code);
      } catch (err) {
        console.error('Preview error:', err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        if (onError) onError(errorMessage);
        
        // Update iframe with error
        if (iframeRef.current) {
          iframeRef.current.srcdoc = generateHtml('', errorMessage);
        }
      } finally {
        if (isMounted) {
          // Ensure loading is turned off after a slight delay to let the iframe render
          setTimeout(() => {
            if (isMounted) {
              setIsLoading(false);
            }
          }, 200);
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
      {isLoading && !iframeLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-8 w-8 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-600">Loading preview...</span>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        title="Code Preview"
        className="h-full w-full border-0"
        sandbox="allow-scripts allow-same-origin"
        style={{ height: '100%', width: '100%', overflow: 'auto' }}
        onLoad={handleIframeLoad}
      />
    </div>
  );
}

export default CodePreview; 