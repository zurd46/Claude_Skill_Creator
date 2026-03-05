// AI-powered skill content generator using OpenRouter
import { chat, type ChatMessage } from "../utils/openrouter.js";
import type { SkillConfig } from "../validation/schemas.js";

const SYSTEM_PROMPT = `You are an expert at creating Claude Code Agent Skills following the official Anthropic specification.

CONTEXT:
- Skills are loaded ON DEMAND — only when invoked or when Claude determines they're relevant.
- This means skills can be more detailed than CLAUDE.md (which loads every session).
- However, skills should still be concise and focused. Under 200 lines is ideal, 500 max.
- Skills are for REPEATABLE WORKFLOWS, not general knowledge Claude already has.

ANTHROPIC SPEC REQUIREMENTS:
1. Output ONLY the markdown content. No code fences around the whole output.
2. SKILL.md must start with YAML frontmatter (---) containing name and description.
3. Description must be in third person and explain WHEN to use the skill.
4. Body under 500 lines. File references one level deep only (./reference.md, not ./dir/file.md).
5. Forward slashes only. No XML tags in name or description.

CONTENT QUALITY:
6. Every line must be ACTIONABLE — not generic advice Claude already knows.
7. Include specific commands, file paths, patterns, and tool names.
8. Write concrete steps, not "Step 1: [Do something]" placeholders.
9. Skills should make Claude MORE EFFECTIVE at a specific task — think "what would a senior dev tell a new team member?"
10. Reference supporting files with markdown links: [reference.md](./reference.md)`;

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
