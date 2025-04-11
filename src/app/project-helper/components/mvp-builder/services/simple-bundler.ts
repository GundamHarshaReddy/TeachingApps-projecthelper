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
    
    // First extract any component name from export default statements
    let componentName = '';
    const exportDefaultMatch = code.match(/export\s+default\s+([A-Za-z0-9_]+)/);
    if (exportDefaultMatch && exportDefaultMatch[1]) {
      componentName = exportDefaultMatch[1];
      console.log("Found exported component:", componentName);
    }
    
    // Extract all imports to add CDN versions if needed
    const imports: Record<string, string[]> = {};
    const importRegex = /import\s+(?:{([^}]*)}|([A-Za-z0-9_$]+))?\s*(?:,\s*(?:{([^}]*)}|([A-Za-z0-9_$]+)))?\s+from\s+['"]([^'"]+)['"][^;]*;/g;
    let match;
    while ((match = importRegex.exec(code)) !== null) {
      const defaultImport = match[2] || match[4];
      const namedImports = (match[1] || match[3] || '').split(',').map(s => s.trim()).filter(Boolean);
      const packageName = match[5];
      
      if (!imports[packageName]) {
        imports[packageName] = [];
      }
      
      if (defaultImport) {
        imports[packageName].push(defaultImport);
      }
      
      imports[packageName].push(...namedImports);
      
      console.log(`Import detected: ${packageName}`, { default: defaultImport, named: namedImports });
    }
    
    // Generate CDN import mappings for common libraries
    const cdnImports = Object.entries(imports).reduce((acc, [pkg, items]) => {
      // Handle known packages 
      if (pkg === 'react' || pkg === 'react-dom') {
        // These are already included in the preview HTML
        return acc;
      }
      
      // For demo purposes, handle some popular libraries
      switch (pkg) {
        case '@heroicons/react/solid':
        case '@heroicons/react/outline':
        case '@heroicons/react/24/solid':
        case '@heroicons/react/24/outline':
          // We'll mock Heroicons
          items.forEach(item => {
            acc.push(`const ${item} = (props) => React.createElement('svg', { 
              ...props, 
              width: props.width || 24,
              height: props.height || 24,
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: 2
            }, React.createElement('rect', { x: 0, y: 0, width: 24, height: 24, fill: 'none' }));`);
          });
          break;
          
        case '@chakra-ui/react':
        case '@mui/material':
        case 'antd':
          // Mock UI components
          items.forEach(item => {
            if (item.includes(' as ')) {
              const [originalName, alias] = item.split(' as ').map(s => s.trim());
              acc.push(`const ${alias} = (props) => React.createElement('div', { 
                ...props, 
                className: 'mock-ui-component mock-${originalName.toLowerCase()} ' + (props.className || '')
              }, props.children || '${originalName}');`);
            } else {
              acc.push(`const ${item} = (props) => React.createElement('div', { 
                ...props, 
                className: 'mock-ui-component mock-${item.toLowerCase()} ' + (props.className || '')
              }, props.children || '${item}');`);
            }
          });
          break;
          
        default:
          // Generic mock for other packages
          items.forEach(item => {
            if (item.includes(' as ')) {
              const [originalName, alias] = item.split(' as ').map(s => s.trim());
              acc.push(`const ${alias} = function() { console.warn('Mock implementation of ${originalName} from ${pkg}'); return null; };`);
            } else {
              acc.push(`const ${item} = function() { console.warn('Mock implementation of ${item} from ${pkg}'); return null; };`);
            }
          });
      }
      
      return acc;
    }, [] as string[]);
    
    // Process imports - we need to handle destructured React imports properly
    let processedCode = code
      // Replace React imports with destructuring - important for hooks like useState
      .replace(/import\s+React,\s*{([^}]*)}\s+from\s+['"]react['"][^;]*;/g, 
        '// React imported globally\n// Destructured imports: $1')
      .replace(/import\s+{\s*([^}]*)\s*}\s+from\s+['"]react['"][^;]*;/g, 
        '// React destructured imports: $1')
      .replace(/import\s+React\s+from\s+['"]react['"][^;]*;/g, 
        '// React imported globally')
      // Handle React-DOM imports
      .replace(/import\s+.*\s+from\s+['"]react-dom.*['"][^;]*;/g, 
        '// ReactDOM imported globally')
      // Comment out other imports
      .replace(/import\s+.*\s+from\s+['"][^'"]+['"][^;]*;/g, 
        '// Import removed: $&')
      // Handle export statements
      .replace(/export\s+default\s+function\s+([A-Za-z0-9_]+)/g, 
        'function $1')
      .replace(/export\s+default\s+class\s+([A-Za-z0-9_]+)/g, 
        'class $1')
      .replace(/export\s+default\s+([A-Za-z0-9_]+);?/g, 
        '/* export default removed */ window.__PreviewComponent = $1;')
      .replace(/export\s+default\s+/g, 
        'window.__PreviewComponent = ');

    // Create the final bundled code with React hooks made available
    const simpleJsCode = `
// Make React hooks directly available in the global scope
const { 
  useState, 
  useEffect, 
  useRef, 
  useContext, 
  useReducer, 
  useCallback, 
  useMemo, 
  useLayoutEffect,
  useId,
  useTransition,
  useDeferredValue,
  useImperativeHandle 
} = React;

// CSS-in-JS helpers
const styled = {
  div: (styles) => (props) => React.createElement('div', { ...props, style: { ...styles, ...props.style } }, props.children),
  span: (styles) => (props) => React.createElement('span', { ...props, style: { ...styles, ...props.style } }, props.children),
  // Add more as needed
};

// Mock implementations for imported modules
${cdnImports.join('\n')}

// Create a mock fetch function for the preview environment
function createMockFetch() {
  const originalFetch = window.fetch;
  
  return function mockFetch(input, init) {
    console.log('Preview environment: Mocking fetch for', input);
    
    // Create a mock response based on the URL
    const createMockResponse = (data) => {
      const body = JSON.stringify(data);
      const blob = new Blob([body], { type: 'application/json' });
      
      return new Response(blob, {
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'Content-Type': 'application/json' })
      });
    };
    
    // Convert the input to a string URL
    const url = typeof input === 'string' ? input : input.toString();
    
    // API data endpoint simulation
    if (url === '/api/complex-data') {
      return Promise.resolve(createMockResponse([
        { 
          id: 1, 
          title: 'Mock Item 1', 
          description: 'This is mock data for preview' 
        },
        { 
          id: 2, 
          title: 'Mock Item 2', 
          description: 'Add your real API endpoint in production' 
        },
        { 
          id: 3, 
          title: 'Mock Item 3', 
          description: 'Preview environment intercepts API calls' 
        }
      ]));
    }
    
    // Generic mock response for any other URL
    return Promise.resolve(createMockResponse({ 
      message: 'Mock data for ' + url
    }));
  };
}

// Assign the mock fetch function
window.fetch = createMockFetch();

// Direct code execution
try {
  ${processedCode}
} catch (error) {
  console.error("Error in component code:", error);
  throw new Error('Component code error: ' + error.message);
}

// Auto-detect the component if not explicitly set by the processed code
if (typeof window.__PreviewComponent === 'undefined') {
  console.log("Component not explicitly assigned, attempting detection");
  
  // Check for uppercase function names (React component convention)
  for (const key of Object.keys(window)) {
    if (['React', 'ReactDOM', 'Babel', 'onerror'].includes(key)) continue;
    
    if (typeof window[key] === 'function' && /^[A-Z]/.test(key)) {
      window.__PreviewComponent = window[key];
      console.log("Auto-detected component:", key);
      break;
    }
  }
  
  // Still not found? Try common names
  if (typeof window.__PreviewComponent === 'undefined') {
    const commonNames = ['App', 'Component', 'Main', 'Root', 'Page', 'Home', 'Dashboard', 'Layout', 'Hello', 'ComplexCode'];
    for (const name of commonNames) {
      if (typeof window[name] === 'function') {
        window.__PreviewComponent = window[name];
        console.log("Found component by common name:", name);
        break;
      }
    }
  }
}

// Safety check for undefined or not a function
if (!window.__PreviewComponent) {
  console.warn("No React component found for preview.");
  throw new Error('No React component found. Make sure your code exports a component with "export default".');
} else if (typeof window.__PreviewComponent !== 'function') {
  console.error("Invalid component type:", typeof window.__PreviewComponent);
  throw new Error('Component must be a function, got: ' + typeof window.__PreviewComponent);
}

// Add debug information
console.log("Available functions:", 
  Object.keys(window)
    .filter(k => typeof window[k] === 'function' && !['React', 'ReactDOM', 'Babel', 'onerror'].includes(k))
    .join(", ")
);`;
    
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