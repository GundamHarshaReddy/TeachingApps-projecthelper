/**
 * Updates code based on a user prompt using Groq LLM API
 * @param prompt The user's prompt/request
 * @param files The current code files
 * @returns Updated code files after AI processing
 */
export async function updateCodeWithAI(prompt: string, files: Record<string, string>) {
  const response = await fetch("/api/playground/ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, files }),
  });
  
  if (!response.ok) {
    throw new Error(`AI request failed: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.updatedFiles;
} 