# AI-Powered React Playground

This is an AI-powered React playground where users can:

- Edit React code (App.jsx, index.js, etc.)
- Use AI to modify code based on prompts
- See a live preview powered by Sandpack
- Leverage external libraries seamlessly

## Tech Stack

- **Framework**: Next.js (App Router)
- **Code Editor + Preview**: Sandpack (@codesandbox/sandpack-react)
- **AI Integration**: Groq API (using llama3-8b-8192)
- **State Management**: Zustand
- **Styling**: Tailwind CSS + lucide-react for icons

## Architecture

The playground consists of these main components:

- `Editor.tsx`: Code editor using Sandpack
- `PromptInput.tsx`: Input for user prompts (AI)
- `Header.tsx`: Header with theme toggle
- `lib/ai.ts`: AI helper functions
- `lib/templates.ts`: Base code files
- `store/files.ts`: Zustand store for file state

## Usage

Type a prompt in the input field to have AI modify your code. The changes will be reflected in real-time in both the editor and the preview.

## Environment Variables

For AI functionality, set the following in `.env.local`:

```
GROQ_API_KEY=your_api_key_here
``` 