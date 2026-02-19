// .claude/rules/ generator - modular rule files
import { chat, type ChatMessage } from "../utils/openrouter.js";
import { isConfigured } from "../utils/openrouter.js";

export interface RulesConfig {
  projectName: string;
  techStack: string[];
  language: string;
  features: string[];
}

export interface RuleFile {
  filename: string;
  content: string;
}

const SYSTEM_PROMPT = `You are an expert at creating Claude Code rule files.

Rules are modular .md files in .claude/rules/ that provide topic-specific instructions to Claude.
Each rule file should:
1. Be concise (under 50 lines ideally)
2. Focus on ONE topic
3. Use imperative form ("Use X", "Always Y", "Never Z")
4. Include specific, actionable instructions
5. Only add knowledge Claude wouldn't already have
6. Can optionally include YAML frontmatter with path filters:

\`\`\`yaml
---
paths:
  - "src/**/*.ts"
---
\`\`\`

Output ONLY the markdown content for the rule file. No code fences around the whole output.`;

function buildRulePrompt(topic: string, config: RulesConfig): string {
  return `Create a Claude Code rule file about "${topic}" for:

Project: ${config.projectName}
Tech Stack: ${config.techStack.join(", ")}
Language: ${config.language}

This rule should contain SPECIFIC, ACTIONABLE instructions about ${topic} for this exact tech stack.
Include path filters in YAML frontmatter if the rule only applies to certain files.
Keep it concise - under 50 lines.`;
}

function detectRuleTopics(config: RulesConfig): string[] {
  const topics: string[] = ["code-style"];

  const stackLower = config.techStack.map((t) => t.toLowerCase());
  const features = config.features.map((f) => f.toLowerCase());

  // Always include testing
  topics.push("testing");

  // Stack-specific rules
  if (stackLower.some((s) => /react|vue|svelte|angular/.test(s))) {
    topics.push("components");
  }

  if (stackLower.some((s) => /express|fastapi|django|flask|next|nest/.test(s))) {
    topics.push("api-design");
  }

  if (stackLower.some((s) => /postgres|mysql|mongo|prisma|drizzle|sequelize|typeorm/.test(s))) {
    topics.push("database");
  }

  if (stackLower.some((s) => /typescript|ts/.test(s))) {
    topics.push("typescript");
  }

  if (features.some((f) => /auth|login|jwt|oauth/.test(f))) {
    topics.push("security");
  }

  if (features.some((f) => /deploy|docker|ci|cd|pipeline/.test(f))) {
    topics.push("deployment");
  }

  return topics;
}

export async function generateRulesWithAI(config: RulesConfig): Promise<RuleFile[]> {
  const topics = detectRuleTopics(config);
  const rules: RuleFile[] = [];

  for (const topic of topics) {
    if (isConfigured()) {
      const messages: ChatMessage[] = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildRulePrompt(topic, config) },
      ];

      try {
        const content = await chat(messages, { temperature: 0.3, maxTokens: 1500 });
        rules.push({
          filename: `${topic}.md`,
          content: content
            .replace(/^```(?:markdown|md)?\n/, "")
            .replace(/\n```\s*$/, "")
            .trim() + "\n",
        });
      } catch {
        rules.push({
          filename: `${topic}.md`,
          content: generateStaticRule(topic, config),
        });
      }
    } else {
      rules.push({
        filename: `${topic}.md`,
        content: generateStaticRule(topic, config),
      });
    }
  }

  return rules;
}

function generateStaticRule(topic: string, config: RulesConfig): string {
  const title = topic
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return `# ${title}

## Conventions

- Follow the established ${topic} patterns in this project
- Use ${config.language} for all source files
- Keep code consistent with the existing codebase

## Guidelines

Add specific ${topic} guidelines for the ${config.techStack.join(", ")} stack here.
`;
}
