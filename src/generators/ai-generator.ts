// AI-powered skill content generator using OpenRouter
import { chat, type ChatMessage } from "../utils/openrouter.js";
import type { SkillConfig } from "../validation/schemas.js";

const SYSTEM_PROMPT = `You are an expert at creating Claude Agent Skills following the official Anthropic specification.

RULES YOU MUST FOLLOW:
1. Output ONLY the markdown content. No explanations, no code fences around the whole output.
2. The SKILL.md must start with YAML frontmatter between --- markers containing name and description.
3. Keep the SKILL.md body under 500 lines.
4. Write concise, actionable instructions. Claude is already very intelligent - only add context it wouldn't already know.
5. Use progressive disclosure: main instructions in SKILL.md, details in referenced files.
6. File references must be one level deep only (e.g., ./reference.md, NOT ./dir/file.md).
7. Use forward slashes only for paths.
8. No XML tags in name or description.
9. Description must be in third person.
10. Use consistent terminology throughout.
11. Include specific, actionable workflows - NOT generic placeholders.
12. Every section must contain REAL, USEFUL content specific to the skill's purpose.
13. Include concrete examples, actual code patterns, real tool names, and practical steps.
14. For checklists and workflows, provide actual items relevant to the skill domain.
15. When referencing supporting files, use markdown links: [reference.md](./reference.md)`;

function buildSkillMdPrompt(config: SkillConfig): string {
  const typeGuide = {
    reference: "Focus on being a knowledge base with key concepts, configuration options, and guidelines. Organize information for quick lookup.",
    task: "Focus on step-by-step workflows with clear procedures. Include validation checklists and expected outputs.",
    hybrid: "Combine reference material with actionable workflows. Include both knowledge sections and step-by-step procedures.",
  };

  const freedomGuide = {
    high: "Write flexible text instructions. Let Claude decide the specific approach based on context. Focus on goals and considerations rather than exact steps.",
    medium: "Provide structured patterns with recommended approaches. Include pseudocode or decision trees where helpful. Balance guidance with flexibility.",
    low: "Write exact step-by-step procedures. Include precise commands, exact output formats, and strict validation checklists. Leave minimal room for interpretation.",
  };

  let fileRefs = "";
  if (config.includeReference) {
    fileRefs += "\n- Include a section that references [reference.md](./reference.md) for detailed API/configuration reference.";
  }
  if (config.includeExamples) {
    fileRefs += "\n- Include a section that references [examples.md](./examples.md) for usage examples and patterns.";
  }

  return `Create a SKILL.md for a Claude Agent Skill with these specifications:

Name: ${config.name}
Description: ${config.description}
Type: ${config.type} - ${typeGuide[config.type]}
Freedom Level: ${config.freedomLevel} - ${freedomGuide[config.freedomLevel]}
${fileRefs ? `\nFile References:${fileRefs}` : ""}
${config.customInstructions ? `\nAdditional Context: ${config.customInstructions}` : ""}

The SKILL.md must:
1. Start with YAML frontmatter (---) containing name and description
2. Have a clear title (# heading)
3. Include sections appropriate for the skill type and freedom level
4. Contain REAL, SPECIFIC, ACTIONABLE content - NOT placeholders like "Concept 1" or "Step 1"
5. Be immediately useful to Claude when loaded as a skill
6. Include specific tools, commands, patterns, and best practices relevant to "${config.name}"

Generate the complete SKILL.md content now.`;
}

function buildReferenceMdPrompt(config: SkillConfig): string {
  return `Create a reference.md file for the Claude Agent Skill "${config.name}".

Skill description: ${config.description}

This is a supporting reference document that provides detailed technical information.
Start with a Table of Contents, then include:
- Configuration options with actual parameter names, types, and defaults
- API reference with real endpoints/functions relevant to the domain
- Important parameters with descriptions
- Error codes or common issues

Write REAL, SPECIFIC content for the "${config.name}" domain - NOT generic placeholders.
Output ONLY the markdown content, no code fences around the whole output.`;
}

function buildExamplesMdPrompt(config: SkillConfig): string {
  return `Create an examples.md file for the Claude Agent Skill "${config.name}".

Skill description: ${config.description}

This is a supporting examples document. Include:
- 3-5 practical, real-world examples with actual input/output pairs
- Common patterns with when to use each
- At least one advanced/complex scenario
- Edge cases with expected behavior

Each example must be SPECIFIC to "${config.name}" with realistic, useful content.
Output ONLY the markdown content, no code fences around the whole output.`;
}

export async function generateSkillMdWithAI(config: SkillConfig): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildSkillMdPrompt(config) },
  ];

  const content = await chat(messages, { temperature: 0.3, maxTokens: 4096 });

  // Strip any wrapping code fences if the model added them
  return content
    .replace(/^```(?:markdown|md)?\n/, "")
    .replace(/\n```\s*$/, "")
    .trim() + "\n";
}

export async function generateReferenceMdWithAI(config: SkillConfig): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildReferenceMdPrompt(config) },
  ];

  const content = await chat(messages, { temperature: 0.3, maxTokens: 4096 });

  return content
    .replace(/^```(?:markdown|md)?\n/, "")
    .replace(/\n```\s*$/, "")
    .trim() + "\n";
}

export async function generateExamplesMdWithAI(config: SkillConfig): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildExamplesMdPrompt(config) },
  ];

  const content = await chat(messages, { temperature: 0.4, maxTokens: 4096 });

  return content
    .replace(/^```(?:markdown|md)?\n/, "")
    .replace(/\n```\s*$/, "")
    .trim() + "\n";
}
