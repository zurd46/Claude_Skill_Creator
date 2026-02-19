// CLAUDE.md generator - main project instructions for Claude Code
import { chat, type ChatMessage } from "../utils/openrouter.js";
import { isConfigured } from "../utils/openrouter.js";

export interface ProjectConfig {
  projectName: string;
  description: string;
  techStack: string[];
  language: string;
  features: string[];
}

const SYSTEM_PROMPT = `You are an expert at configuring Claude Code projects. You create CLAUDE.md files that serve as the main project memory/instructions file.

RULES:
1. Output ONLY the markdown content. No code fences around the whole output.
2. CLAUDE.md is loaded into Claude's context for EVERY conversation in this project.
3. Keep it concise but comprehensive - every line matters.
4. Focus on project-specific knowledge Claude wouldn't already know.
5. Include: project structure, conventions, common commands, important patterns.
6. Do NOT explain general programming concepts Claude already knows.
7. Use clear headings and bullet points for quick scanning.
8. Include specific file paths, command names, and configuration details.
9. Write in imperative form ("Use X", "Always Y", "Never Z").
10. Keep under 200 lines for optimal performance.`;

function buildClaudeMdPrompt(config: ProjectConfig): string {
  return `Create a CLAUDE.md file for a project with these specifications:

Project: ${config.projectName}
Description: ${config.description}
Tech Stack: ${config.techStack.join(", ")}
Primary Language: ${config.language}
Key Features: ${config.features.join(", ")}

The CLAUDE.md should include:
1. Project overview (2-3 lines max)
2. Tech stack summary
3. Project structure with actual directory layout
4. Development commands (build, test, dev, lint)
5. Code conventions specific to this stack
6. Architecture patterns used
7. Important files and their purposes
8. Common pitfalls and how to avoid them
9. Testing approach
10. Environment setup requirements

Make it SPECIFIC to this exact tech stack and project type. Not generic.`;
}

export async function generateClaudeMdWithAI(config: ProjectConfig): Promise<string> {
  if (!isConfigured()) {
    return generateClaudeMdStatic(config);
  }

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildClaudeMdPrompt(config) },
  ];

  const content = await chat(messages, { temperature: 0.3, maxTokens: 4096 });

  return content
    .replace(/^```(?:markdown|md)?\n/, "")
    .replace(/\n```\s*$/, "")
    .trim() + "\n";
}

export function generateClaudeMdStatic(config: ProjectConfig): string {
  return `# ${config.projectName}

${config.description}

## Tech Stack

${config.techStack.map((t) => `- ${t}`).join("\n")}

## Project Structure

\`\`\`
src/
  # Add your project structure here
\`\`\`

## Development

\`\`\`bash
# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build

# Test
npm test

# Lint
npm run lint
\`\`\`

## Conventions

- Use ${config.language} for all source files
- Follow the established patterns in the codebase
- Write tests for new features
- Keep functions small and focused

## Architecture

Describe the architecture patterns used in this project.

## Important Files

- \`src/index.ts\` - Entry point
- \`package.json\` - Dependencies and scripts
- \`tsconfig.json\` - TypeScript configuration

## Testing

- Write unit tests alongside source files
- Use descriptive test names
- Test edge cases and error paths
`;
}
