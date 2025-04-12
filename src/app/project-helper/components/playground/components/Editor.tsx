"use client";

import { Sandpack } from "@codesandbox/sandpack-react";
import { useFileStore } from "../store/files";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";

// Define some additional styles for the Sandpack component
const sandpackStyles = `
  .custom-wrapper {
    --sp-border-radius: 8px;
    height: 650px !important;
    max-height: 80vh !important;
  }
  .custom-layout {
    display: flex !important;
    flex-direction: row !important;
    height: 100% !important;
    overflow: hidden !important;
  }
  @media (max-width: 768px) {
    .custom-layout {
      flex-direction: column !important;
    }
  }
  .custom-editor {
    flex: 1 !important;
    width: 50% !important;
    max-width: 50% !important;
    overflow: auto !important;
  }
  .custom-preview {
    flex: 1 !important;
    width: 50% !important;
    max-width: 50% !important;
    overflow: hidden !important;
    border-left: 1px solid #e0e0e0 !important;
  }
  .sp-wrapper {
    height: 100% !important;
  }
  .sp-stack {
    height: 100% !important;
  }
  .sp-preview-container {
    height: 100% !important;
    overflow: auto !important;
  }
  .sp-preview {
    height: 100% !important;
  }
  .sp-preview-iframe {
    height: 100% !important;
    background-color: white !important;
  }
  .sp-code-editor {
    height: 100% !important;
  }
`;

// Additional customized styles to override default Sandpack styles
const additionalStyles = `
  /* Reset default sizing behavior */
  .sp-layout > :first-child {
    flex: 1 !important;
    width: 50% !important;
    min-width: 200px !important;
    max-width: 50% !important;
  }
  
  .sp-layout > :last-child {
    flex: 1 !important;
    width: 50% !important;
    min-width: 200px !important;
    max-width: 50% !important;
  }
  
  /* Force equal sizing on small screens */
  @media (max-width: 768px) {
    .sp-layout > :first-child,
    .sp-layout > :last-child {
      width: 100% !important;
      max-width: 100% !important;
      height: 50% !important;
    }
  }
`;

export default function Editor() {
  const { files } = useFileStore();
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset error when files change
  useEffect(() => {
    setError(null);
  }, [files]);

  // Determine theme for Sandpack
  const sandpackTheme = mounted && theme === "dark" ? "dark" : "light";

  return (
    <div className="border border-slate-200 rounded-md overflow-hidden h-[650px]" style={{ maxHeight: '80vh' }}>
      <style>{sandpackStyles}</style>
      <style>{additionalStyles}</style>
      
      {error && (
        <div className="p-3 bg-red-50 border-b border-red-200 text-red-700 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error loading preview</p>
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-1">
              Try clicking the Reset button in the header or reload the page.
            </p>
          </div>
        </div>
      )}
      
      <Sandpack
        key={Object.keys(files).join(',')} // Re-render when files change
        template="react"
        theme={sandpackTheme}
        files={files}
        options={{
          showNavigator: true,
          showTabs: true,
          showLineNumbers: true,
          showInlineErrors: true,
          wrapContent: true,
          editorHeight: "100%", // Use full height
          classes: {
            "sp-wrapper": "custom-wrapper",
            "sp-layout": "custom-layout",
            "sp-editor": "custom-editor",
            "sp-preview": "custom-preview",
          },
          recompileDelay: 300,
          recompileMode: "immediate",
        }}
        customSetup={{
          dependencies: {
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
          },
          entry: "/index.js"
        }}
      />
    </div>
  );
} 