import { GoogleGenAI } from "@google/genai";
import { FileNode, ProjectOptions } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const createSystemInstruction = () => {
  return `You are an expert software architect and senior full-stack engineer. Your task is to act as a "Prompt-to-Project" generator. You will receive a natural language description of a web application, along with optional technical preferences. Based on this input, you must generate a complete, well-structured, and ready-to-run starter project codebase.

Your output MUST be a single, valid JSON object representing an array of file and folder nodes for the project's root directory. Do not add any explanatory text before or after the JSON object.

- A 'file' node must have the structure: \`{ "type": "file", "name": "filename.ext", "content": "file content as a string" }\`.
- A 'folder' node must have the structure: \`{ "type": "folder", "name": "folder_name", "children": [...] }\`, where 'children' is an array of file or folder nodes.
- All file content must be properly escaped as a single string within the JSON.

**CRITICAL RULES:**
1.  **Analyze and Infer:** Deeply analyze the user's prompt to understand core entities, features, and user flows. Infer a logical file and directory structure for a modern web application based on the requested stack.
2.  **Generate High-Quality Code:** Generate idiomatic, high-quality code for each file. The code must be functional, commented where necessary, and follow best practices for the chosen technologies.
3.  **No Placeholders:** Do not generate placeholder or "TODO" code. Generate real, working sample code that implements a basic version of the requested features. For example, if asked for a task tracker, generate files for a 'Task' model, API endpoints to list/create tasks, and a simple UI to display them.
4.  **Essential Configs:** Include essential configuration files like \`package.json\` (with relevant dependencies), \`.gitignore\`, \`.env.example\`, and any framework-specific config files (e.g., \`tsconfig.json\`, \`next.config.js\`).
5.  **Comprehensive README:** Generate a detailed \`README.md\` that includes:
    - An overview of the project.
    - Setup and installation instructions.
    - Instructions on how to run the project locally.
    - A "How It Works" section detailing the project structure. This section should provide a brief explanation of key files and folders to help the user understand the codebase.`;
};

const createUserPrompt = (options: ProjectOptions) => {
  const stackInfo = options.stack === 'Custom'
    ? `- **Custom Stack:**\n  - **Frontend:** ${options.frontend}\n  - **Backend:** ${options.backend}`
    : `- **Stack:** ${options.stack}`;

  return `Generate a complete starter project based on the following requirements.

**Project Description:**
${options.description}

**Technical Preferences:**
${stackInfo}
- **Architecture Pattern:** ${options.pattern}
- **Authentication:** ${options.auth}
- **Testing Framework:** ${options.testing}
- **Infrastructure:** ${options.infra}

Remember to return ONLY the JSON object representing the file structure.`;
};

export const generateProjectStructure = async (options: ProjectOptions): Promise<FileNode[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: createUserPrompt(options),
      config: {
        systemInstruction: createSystemInstruction(),
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 32768 }
      },
    });

    const jsonText = response.text.trim();
    
    // Basic validation to ensure we have what looks like an array
    if (!jsonText.startsWith('[') || !jsonText.endsWith(']')) {
        throw new Error('Invalid JSON response from API. Expected a root array.');
    }
    
    const parsedJson = JSON.parse(jsonText);

    // Further validation could be added here to check the structure of FileNode
    if (!Array.isArray(parsedJson)) {
        throw new Error('Parsed JSON is not an array as expected.');
    }
    
    return parsedJson as FileNode[];

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate project structure: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
  }
};

export const generateCodeSnippet = async (fileContent: string, snippetDescription: string): Promise<string> => {
      const systemInstruction = `You are an expert code analysis tool. Your task is to extract a specific function, component, or code block from a given file based on a user's description.
You MUST return ONLY the raw code snippet requested.
Do not include any markdown formatting (like \`\`\`typescript), explanations, or any introductory text like "Here is the code snippet:".
Your output should be immediately usable as a piece of code.`;

      const userPrompt = `Here is the full file content:
---
${fileContent}
---

Please extract the code for the following part: "${snippetDescription}"`;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash", // Use flash for speed
          contents: userPrompt,
          config: {
            systemInstruction: systemInstruction,
            responseMimeType: "text/plain",
          },
        });
        return response.text.trim();
      } catch (error) {
        console.error("Error calling Gemini API for snippet generation:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate code snippet: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the code snippet.");
      }
    };
