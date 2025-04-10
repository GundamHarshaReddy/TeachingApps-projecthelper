// A simple alternative bundler that doesn't use WebAssembly
// to be used as a fallback when esbuild-wasm fails

declare global {
  interface Window {
    __PreviewComponent?: React.ComponentType<any> | null;
    React?: any;
    ReactDOM?: any;
    Babel?: any;
    [key: string]: any;
  }
}

interface BundleResult {
  code: string;
  error?: string;
}

export async function simpleBundle(code: string): Promise<BundleResult> {
  try {
    console.log("Processing with simple bundler");
    
    // Process the raw code
    // 1. Replace React imports (React is included globally in the preview)
    // 2. Replace export statements to work in our environment
    // 3. Add code to expose the component globally
    
    const simpleJsCode = `
      try {
        // Execute the bundled code
        ${code
          // Remove import statements (React is included globally)
          .replace(/import\\s+React[^;]*;/g, '// React imported globally')
          .replace(/import\\s+{[^}]*}\\s+from\\s+['"]react['"][^;]*;/g, '// React imports included globally')
          .replace(/import\\s+.*\\s+from\\s+['"]react-dom.*['"][^;]*;/g, '// ReactDOM imported globally')
          
          // Convert export statements
          .replace(/export\\s+default\\s+function\\s+([A-Za-z0-9_]+)/g, 'function $1')
          .replace(/export\\s+default\\s+class\\s+([A-Za-z0-9_]+)/g, 'class $1')
          .replace(/export\\s+default\\s+([A-Za-z0-9_]+);?/g, 'window.__PreviewComponent = $1;')
          .replace(/export\\s+default\\s+(\\(.*?\\)\\s*=>\\s*{.*?})/g, 'window.__PreviewComponent = $1;')
          .replace(/export\\s+default\\s+(\\(.*?\\)\\s*=>\\s*\\(.*?\\))/g, 'window.__PreviewComponent = $1;')
        }
        
        // Auto-detect the component if not explicitly exported
        if (typeof window.__PreviewComponent === 'undefined') {
          // Look for component declarations - common patterns
          const commonComponentNames = ['App', 'Component', 'Main', 'Root', 'Page', 'Home', 'Dashboard', 'Layout'];
          
          // First check for functions that are likely components (start with capital letter)
          for (const key of Object.keys(window)) {
            // Skip built-ins and React itself
            if (['React', 'ReactDOM', 'Babel', 'onerror'].includes(key)) continue;
            
            // Check if it's a function and starts with capital letter (React component convention)
            if (typeof window[key] === 'function' && /^[A-Z]/.test(key)) {
              window.__PreviewComponent = window[key];
              console.log("Auto-detected component:", key);
              break;
            }
          }
          
          // If no component found by convention, try common names
          if (typeof window.__PreviewComponent === 'undefined') {
            for (const name of commonComponentNames) {
              if (typeof window[name] === 'function') {
                window.__PreviewComponent = window[name];
                console.log("Found component by common name:", name);
                break;
              }
            }
          }
        }
        
        // Check if we have a valid component at this point
        if (window.__PreviewComponent) {
          console.log("Successfully found preview component:", typeof window.__PreviewComponent);
          if (typeof window.__PreviewComponent !== 'function') {
            console.error("Invalid component type:", window.__PreviewComponent);
            throw new Error("Expected a function component but got " + typeof window.__PreviewComponent);
          }
        } else {
          console.warn("No React component found for preview. Check if you're exporting a valid component.");
        }
      } catch (err) {
        console.error('Error in simple bundler:', err);
        throw err;
      }
    `;
    
    return { code: simpleJsCode };
  } catch (error) {
    console.error('Simple bundling error:', error);
    return { 
      code: '', 
      error: error instanceof Error 
        ? error.message 
        : 'Error in simple bundler fallback' 
    };
  }
} 