export const defaultFiles = {
  "/App.jsx": `export default function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ color: '#0070f3' }}>Portfolio Website</h1>
      <p>
        Welcome to my portfolio website! Here you can explore my projects and skills.
      </p>
      <ul>
        <li>
          <a href="#" target="_blank">
            Project 1: A brief description of the project
          </a>
        </li>
        <li>
          <a href="#" target="_blank">
            Project 2: A brief description of the project
          </a>
        </li>
        <li>
          <a href="#" target="_blank">
            Project 3: A brief description of the project
          </a>
        </li>
      </ul>
      <button 
        style={{
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '10px'
        }}
        onClick={() => alert('Contact me!')}
      >
        Contact Me
      </button>
    </div>
  );
}`,
  "/index.js": `import { createRoot } from "react-dom/client";
import App from "./App.jsx";

const root = createRoot(document.getElementById("root"));
root.render(<App />);`,
  "/index.html": `<!DOCTYPE html>
<html>
  <head>
    <title>React Playground</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
}; 