// Import only the browser version of esbuild-wasm
// This avoids the Node.js specific imports
import * as esbuild from 'esbuild-wasm';
import { unpkgPathPlugin } from '../plugins/unpkg-plugin';

// Track if esbuild has been initialized
let esbuildInitialized = false;
let esbuildInitializing = false;
let initPromise: Promise<void> | null = null;

// Initialize esbuild
const initializeEsbuild = async (): Promise<void> => {
  // If already initialized, return immediately
  if (esbuildInitialized) return;
  
  // If initialization is in progress, wait for it
  if (esbuildInitializing && initPromise) {
    try {
      await initPromise;
      return;
    } catch (err) {
      console.error('Error waiting for esbuild initialization:', err);
      throw err;
    }
  }
  
  // Start initialization
  esbuildInitializing = true;
  
  initPromise = (async () => {
    try {
      await esbuild.initialize({
        wasmURL: 'https://unpkg.com/esbuild-wasm@0.18.20/esbuild.wasm',
      });
      esbuildInitialized = true;
      console.log('esbuild initialized');
    } catch (err) {
      console.error('Failed to initialize esbuild:', err);
      esbuildInitializing = false;
      throw new Error('Failed to initialize esbuild');
    }
  })();
  
  return initPromise;
};

interface BundleResult {
  code: string;
  error?: string;
}

export const bundle = async (input: string): Promise<BundleResult> => {
  try {
    // Try to initialize esbuild (will return early if already initialized)
    await initializeEsbuild();
    
    console.log('Transforming code with esbuild');
    
    const result = await esbuild.transform(input, {
      loader: 'jsx',
      target: 'es2015',
      format: 'iife',
      jsx: 'transform',
      minify: false,
    });
    
    if (result.warnings && result.warnings.length > 0) {
      console.warn('Transformation warnings:', result.warnings);
    }
    
    // Process the transformed code to make components globally available
    const code = processTransformedCode(result.code);
    
    console.log('Successfully transformed code');
    return { code };
  } catch (err) {
    console.error('Error during bundling:', err);
    return { 
      code: '',
      error: err instanceof Error ? err.message : 'Unknown error during bundling'
    };
  }
}; 

// Helper function to process the transformed code
function processTransformedCode(code: string): string {
  // Remove export statements but keep the component declarations
  let processedCode = code
    .replace(/export\s+default\s+/g, '')
    .replace(/export\s+/g, '');
  
  // Try to find component name from function or const declarations
  const functionMatch = processedCode.match(/function\s+([A-Z][A-Za-z0-9_]+)\s*\(/);
  const constMatch = processedCode.match(/const\s+([A-Z][A-Za-z0-9_]+)\s*=/);
  
  // Add code to expose the component globally
  if (functionMatch && functionMatch[1]) {
    const componentName = functionMatch[1];
    processedCode += `\n\n// Expose component to global scope\nwindow.default = ${componentName};\nwindow.${componentName} = ${componentName};\nconsole.log("Exposed component:", "${componentName}");`;
  } else if (constMatch && constMatch[1]) {
    const componentName = constMatch[1];
    processedCode += `\n\n// Expose component to global scope\nwindow.default = ${componentName};\nwindow.${componentName} = ${componentName};\nconsole.log("Exposed component:", "${componentName}");`;
  }
  
  return processedCode;
} 