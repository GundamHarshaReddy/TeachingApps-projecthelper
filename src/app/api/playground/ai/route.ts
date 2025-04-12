import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt, files } = await req.json();

    // Format the code files to include in the prompt
    const codeStr = Object.entries(files)
      .map(([name, content]) => `File: ${name}\n\`\`\`jsx\n${content}\n\`\`\``)
      .join("\n\n");

    const messages = [
      {
        role: "system" as const,
        content: 
          "You are a code editor assistant for a React playground. " +
          "Modify the provided React files based on the user's request. " +
          "Always return ALL files that were sent, even if not modified. " +
          "IMPORTANT: Make sure to reference App.jsx (not App.js) in imports. " +
          "Format your response with the file name followed by code blocks, e.g.:\n\n" +
          "File: /App.jsx\n```jsx\n// modified code\n```\n\n" +
          "File: /index.js\n```jsx\n// modified code\n```",
      },
      {
        role: "user" as const,
        content: `${codeStr}\n\nUser Request: ${prompt}`,
      },
    ];

    // Make the API call to Groq
    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192", // Using Llama3, you can also use "mixtral-8x7b-32768" or other Groq models
      messages,
      temperature: 0.2,
      max_tokens: 3000,
    });

    // Extract the updated code files from the response
    const updatedFiles = extractCodeBlocks(completion.choices[0].message.content || "");
    
    // Make sure all files from the original set are included
    Object.keys(files).forEach(filename => {
      if (!updatedFiles[filename]) {
        updatedFiles[filename] = files[filename];
      }
    });

    return NextResponse.json({ updatedFiles });
  } catch (error: any) {
    console.error("Error in AI API route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process the request" },
      { status: 500 }
    );
  }
}

// Helper function to extract code blocks from the AI response
function extractCodeBlocks(raw: string): Record<string, string> {
  const regex = /File:\s*(.+?)\n```(?:jsx?|tsx?)?(?:\s*)\n([\s\S]*?)```/g;
  const result: Record<string, string> = {};
  let match;
  
  while ((match = regex.exec(raw)) !== null) {
    const filename = match[1].trim();
    result[filename] = match[2];
  }
  
  return result;
} 