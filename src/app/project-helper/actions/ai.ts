"use server"

import type { Message } from "../types"
import Groq from "groq-sdk";

// Initialize Groq client
const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY || 'dummy-key',
});

// Helper function for text generation to avoid repetition
async function generateText({ prompt, temperature = 0.7, maxTokens = 2000 }: { prompt: string; temperature?: number; maxTokens?: number }) {
  try {
    if (!process.env.GROQ_API_KEY) {
      // For development without API key, return mock data
      console.warn("No GROQ_API_KEY found. Using mock data.");
      return { text: `# Mock Project: ${prompt.slice(0, 30)}...\n\nThis is mock data as no API key was provided.` };
    }
    
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-70b-8192",
      temperature,
      max_tokens: maxTokens,
    });
    
    if (!completion || !completion.choices || completion.choices.length === 0) {
      throw new Error("Empty response from AI model");
    }
    
    return { text: completion.choices[0]?.message?.content || "" };
  } catch (error) {
    console.error("Error generating text:", error);
    
    // Provide more specific error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        throw new Error("Invalid or missing API key. Please check your configuration.");
      } else if (error.message.includes("timeout") || error.message.includes("request timed out")) {
        throw new Error("The request timed out. The model may be overloaded, please try again later.");
      } else if (error.message.includes("rate limit")) {
        throw new Error("Rate limit exceeded. Please wait a moment before trying again.");
      }
    }
    
    // Generic fallback error
    throw new Error("Failed to generate text. Please try again later.");
  }
}

export async function generateProjectIdea(
  projectDomain: string,
  subject: string,
  interestsOrTopic: string,
  toolsOrProjectType: string,
  skillLevel: string,
  projectDuration: string,
  targetAudience: string,
  grade: string,
  detailedExplanation: string,
) {
  // Validate inputs to prevent common errors
  if (!subject || !interestsOrTopic || !toolsOrProjectType) {
    throw new Error("Please provide subject, interests/topic, and tools/project type.");
  }

  const prompt = `Generate a unique ${projectDomain} project idea for a student with the following parameters:
Subject: ${subject}
${projectDomain === "technical" ? "Interests" : "Topic"}: ${interestsOrTopic}
${projectDomain === "technical" ? "Tools/Technologies" : "Project Type"}: ${toolsOrProjectType}
Skill Level: ${skillLevel}
Project Duration: ${projectDuration} days
Target Audience: ${targetAudience}
Grade Level: ${grade}
Detailed Explanation: ${detailedExplanation}

${
  projectDomain === "technical"
    ? "Ensure the project idea incorporates the specified tools/technologies."
    : `Ensure the project idea aligns with the selected project type: ${toolsOrProjectType}. Tailor the project structure and activities to fit this type of project.`
}

Provide a detailed project idea that combines these elements and is suitable for the given skill level, duration, target audience, and grade level. Include the following sections:
1. Project Title
2. Project Overview
3. Key Features
4. Learning Objectives
5. ${projectDomain === "technical" ? "Technical Requirements" : "Project Requirements"}
6. ${projectDomain === "technical" ? "System Architecture" : "Project Structure"}
7. Potential Challenges
8. Impact and Relevance
9. Future Enhancements
10. ${projectDomain === "technical" ? "Security Considerations" : "Ethical Considerations"}

Incorporate the user's detailed explanation into the project idea, ensuring that their specific requirements and goals are addressed.

Format your response in markdown, using headings, bullet points, and emphasis where appropriate. Do not include a timeline or schedule in this idea generation.`

  try {
    // Add a retry mechanism for this specific function
    let attempts = 0;
    const maxAttempts = 3;
    let lastError = null;
    
    while (attempts < maxAttempts) {
      try {
        const { text } = await generateText({
          prompt,
          temperature: 0.7,
          maxTokens: 2500, // Increase token limit for more detailed responses
        });
        
        if (!text || text.trim().length < 50) {
          throw new Error("Generated response is too short or empty");
        }
        
        return text;
      } catch (error) {
        lastError = error;
        attempts++;
        // Wait before retrying (exponential backoff)
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }
    }
    
    // If we've exhausted all attempts, throw the last error
    throw lastError || new Error("Failed after multiple attempts");
  } catch (error) {
    console.error("Error in generateProjectIdea:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        throw new Error("API key error: Please check your GROQ_API_KEY configuration in .env.local file.");
      } else if (error.message.includes("timeout") || error.message.includes("timed out")) {
        throw new Error("The request timed out. The AI service may be overloaded, please try again later.");
      }
    }
    
    // Generic fallback error
    throw new Error("Failed to generate project idea. Please check your connection and try again.");
  }
}

export async function modifyProjectIdea(currentIdea: string, userSuggestion: string) {
  const prompt = `Current project idea:
${currentIdea}

User suggestion for modification:
${userSuggestion}

Please modify the current project idea based on the user's suggestion. Maintain the overall structure and scope of the project, but incorporate the user's ideas where appropriate. Format your response in markdown, using headings, bullet points, and emphasis where appropriate.`

  try {
    const { text } = await generateText({
      prompt,
    });
    return text;
  } catch (error) {
    console.error("Error in modifyProjectIdea:", error);
    throw new Error("Failed to modify project idea. Please try again.");
  }
}

export async function generateProjectPlan(projectIdea: string, duration: string, grade: string, projectDomain: string) {
  const prompt = `Based on the following project idea, duration, grade level, and project domain, generate a detailed project timeline:

Project Idea:
${projectIdea}

Project Duration: ${duration} days
Grade Level: ${grade}
Project Domain: ${projectDomain}

Create a detailed project timeline that is appropriate for a ${projectDomain} project. 
${
  projectDomain === "technical"
    ? "Include technical milestones, development phases, testing, and deployment steps."
    : "Focus on research, content creation, presentation preparation, or experimental setup depending on the project type."
}

Format the response using proper markdown:

# Project Timeline

## Project Phases
List the main phases of the project

## Milestones
Key achievements and checkpoints

## Task Breakdown
### Phase 1: [Phase Name] (Days X-Y)
- Task 1
- Task 2
- Task 3

[Continue for each phase]

## Dependencies
- List key dependencies between tasks

## Resource Allocation
- List required resources and roles

## Risk Assessment
- Identify potential risks
- Include mitigation strategies

## Deliverables
- List expected outputs for each phase

## Review Points
- Include checkpoints for review and feedback

Use proper markdown formatting:
- Use # for main title
- Use ## for sections
- Use ### for subsections
- Use - for bullet points
- Use **bold** for emphasis
- Use *italic* for secondary emphasis`

  try {
    const { text } = await generateText({
      prompt,
    });
    return text;
  } catch (error) {
    console.error("Error in generateProjectPlan:", error);
    throw new Error("Failed to generate project plan. Please try again.");
  }
}

export async function generateResources(projectDescription: string, projectDomain: string, grade: string, duration: string) {
  const prompt = `Based on the following project details, suggest educational resources:

Project Description:
${projectDescription}

Project Domain: ${projectDomain}
Grade Level: ${grade}
Project Duration: ${duration} days

Provide a comprehensive list of educational resources that would be helpful for completing this project. Include the following categories:

# Educational Resources

## Learning Materials
- List online courses, tutorials, documentation, and guides
- Include book recommendations
- Suggest video tutorials and lectures

## Tools and Technologies
- Recommend specific tools, software, libraries, or frameworks
- Include links to documentation where possible
- Suggest both free and premium options

## Example Projects
- Provide links to similar projects for inspiration
- Include open-source repositories if applicable
- Suggest case studies to learn from

## Communities and Forums
- Recommend online communities for support
- Include relevant forums or discussion groups
- Suggest mentorship opportunities if applicable

## Assessment and Evaluation
- Provide resources for testing and validating the project
- Include rubrics or evaluation criteria
- Suggest methods for gathering feedback

For each resource, provide:
1. A title or name
2. A brief description (1-2 sentences)
3. A link when available
4. An indication of difficulty level (Beginner, Intermediate, Advanced)

Format your response using proper markdown with clear headings, bullet points, and emphasis where appropriate.`

  try {
    const { text } = await generateText({
      prompt,
    });
    return text;
  } catch (error) {
    console.error("Error in generateResources:", error);
    throw new Error("Failed to generate resources. Please try again.");
  }
}

export async function modifyProjectPlan(currentPlan: string, userSuggestion: string) {
  const prompt = `Current project plan:
${currentPlan}

User suggestion for modification:
${userSuggestion}

Please modify the current project plan based on the user's suggestion. Maintain the overall structure and timeframe, but incorporate the user's ideas where appropriate. Format your response in markdown, using headings, bullet points, and emphasis where appropriate.`

  try {
    const { text } = await generateText({
      prompt,
    });
    return text;
  } catch (error) {
    console.error("Error in modifyProjectPlan:", error);
    throw new Error("Failed to modify project plan. Please try again.");
  }
}

export async function modifyResources(currentResources: string, userSuggestion: string) {
  const prompt = `Current resource list:
${currentResources}

User suggestion for modification:
${userSuggestion}

Please modify the current resource list based on the user's suggestion. Keep the overall structure, but add, remove, or modify resources as requested. Format your response in markdown, using headings, bullet points, and emphasis where appropriate.`

  try {
    const { text } = await generateText({
      prompt,
    });
    return text;
  } catch (error) {
    console.error("Error in modifyResources:", error);
    throw new Error("Failed to modify resources. Please try again.");
  }
}

export async function generateChatResponse(messages: Message[], topic: string) {
  const formattedMessages = messages.map(m => ({
    role: m.role,
    content: m.content
  }));

  const prompt = `You are an AI assistant helping a student with their project on ${topic}. Answer their questions, provide guidance, and offer suggestions based on the conversation history.

Conversation History:
${formattedMessages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')}

Keep your response concise, helpful, and specific to the student's project context. Use markdown formatting for better readability.`;

  try {
    const { text } = await generateText({
      prompt,
      temperature: 0.7,
      maxTokens: 1500,
    });
    return text;
  } catch (error) {
    console.error("Error in generateChatResponse:", error);
    throw new Error("Failed to generate a response. Please try again.");
  }
}