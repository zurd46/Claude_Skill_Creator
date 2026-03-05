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

CRITICAL CONTEXT:
- CLAUDE.md is loaded into Claude's context for EVERY conversation — it consumes tokens.
- LLMs can reliably follow ~150-200 instructions. Claude Code's system prompt already uses ~50. Less is more.
- Overly detailed CLAUDE.md files cause Claude to IGNORE instructions. Bloat = worse results.
- Code style belongs in linters/formatters, NOT in CLAUDE.md.
- Task-specific instructions belong in .claude/rules/ or skills, NOT here.

RULES:
1. Output ONLY the markdown content. No code fences around the whole output.
2. TARGET 50-100 LINES MAXIMUM. For every line, ask: "Would removing this cause Claude to make mistakes?" If not, cut it.
3. Only include what Claude CANNOT infer from the codebase itself.
4. Focus on the 3 essentials: WHAT (stack/structure), WHY (purpose), HOW (commands/workflows).
5. Write concrete, verifiable instructions ("Use 2-space indentation" not "Format code properly").
6. Use imperative form ("Use X", "Run Y", "Never Z").
7. Use markdown headers and bullets — organized sections, not dense paragraphs.
8. Do NOT include: general programming knowledge, code style rules (use linters), exhaustive command lists, or explanations of frameworks Claude already knows.
9. Do NOT add placeholder sections like "Describe architecture here" — if you don't have the info, omit the section entirely.
10. Reference detail docs with @imports where appropriate instead of inlining everything.`;

function buildClaudeMdPrompt(config: ProjectConfig): string {
  return `Create a CLAUDE.md file for this project:

Project: ${config.projectName}
Description: ${config.description}
Tech Stack: ${config.techStack.join(", ")}
Primary Language: ${config.language}
Key Features: ${config.features.join(", ")}

STRUCTURE (keep it lean — 50-100 lines total):

1. **Project header** — 1-2 line description, nothing more
2. **Tech Stack** — bullet list, only the essentials
3. **Quick Commands** — only build, dev, test, lint (the 4 commands developers run daily)
4. **Project Structure** — high-level directory layout, max 10-15 lines
5. **Key Conventions** — only rules Claude can't infer from code (max 5-7 bullets)
6. **Important Context** — non-obvious decisions, gotchas, or constraints specific to THIS project

DO NOT include:
- Code style rules (these go in linters, not CLAUDE.md)
- Generic best practices Claude already knows
- Sections with placeholder content — omit if you don't have real info
- Detailed architecture docs — reference with @docs/architecture.md instead
- Testing philosophy — just the test command is enough
- Environment setup beyond what's essential

The goal: a developer (or Claude) reads this in 30 seconds and knows how to work in the project. Nothing more.`;
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
  const pkgManager = config.techStack.some((t) =>
    ["bun"].includes(t.toLowerCase())
  )
    ? "bun"
    : config.techStack.some((t) => ["pnpm"].includes(t.toLowerCase()))
      ? "pnpm"
      : "npm";

  return `# ${config.projectName}

${config.description}

## Tech Stack

${config.techStack.map((t) => `- ${t}`).join("\n")}

## Commands

\`\`\`bash
${pkgManager} run dev      # Start development server
${pkgManager} run build    # Production build
${pkgManager} test         # Run tests
${pkgManager} run lint     # Lint and format
\`\`\`

## Project Structure

\`\`\`
src/                       # Source code
${config.techStack.some((t) => ["react", "vue", "svelte", "angular"].includes(t.toLowerCase())) ? "  components/            # UI components\n  pages/                 # Route pages\n" : ""}  lib/                   # Shared utilities
tests/                     # Test files
\`\`\`

## Key Conventions

- Use ${config.language} for all source files
- Run tests before committing
`;
}
