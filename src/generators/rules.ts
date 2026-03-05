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

const SYSTEM_PROMPT = `You are an expert at creating Claude Code rule files (.claude/rules/*.md).

CONTEXT:
- Rules are loaded into Claude's context alongside CLAUDE.md — they consume tokens.
- Rules WITHOUT path filters load EVERY session. Rules WITH path filters load only when matching files are opened.
- This means: ALWAYS use path filters when a rule only applies to specific file types.

RULES FOR WRITING RULES:
1. Output ONLY the markdown content. No code fences around the whole output.
2. Keep each rule file under 30 lines. Concise = better adherence.
3. Focus on ONE topic per file.
4. Use imperative form ("Use X", "Always Y", "Never Z").
5. Only include instructions Claude CANNOT infer from the code itself.
6. Do NOT repeat general knowledge (how to write tests, how React works, etc.)
7. Focus on PROJECT-SPECIFIC conventions and non-obvious decisions.
8. ALWAYS include YAML frontmatter with paths when the rule targets specific file types.
9. Use glob patterns: "src/**/*.ts", "**/*.test.ts", "src/components/**/*.tsx"`;

function buildRulePrompt(topic: string, config: RulesConfig): string {
  const pathHints: Record<string, string> = {
    "code-style": `paths relevant to ${config.language} source files`,
    testing: "paths for test files (**/*.test.*, **/*.spec.*)",
    components: "paths for component files (src/components/**/*)",
    "api-design": "paths for API/route files (src/api/**, src/routes/**)",
    database: "paths for database files (src/db/**, **/migrations/**, **/*.prisma)",
    typescript: `paths for TypeScript files (**/*.ts, **/*.tsx)`,
    security: "paths for auth files (src/auth/**, src/middleware/**)",
    deployment: "paths for config files (Dockerfile, .github/**, docker-compose.*)",
  };

  return `Create a Claude Code rule file about "${topic}" for:

Project: ${config.projectName}
Tech Stack: ${config.techStack.join(", ")}
Language: ${config.language}

IMPORTANT:
- Include YAML frontmatter with ${pathHints[topic] || "relevant path filters"}
- Write 5-10 specific, actionable instructions for this exact stack
- Do NOT write generic advice — only project-specific conventions
- Under 30 lines total`;
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
  const stackLower = config.techStack.map((t) => t.toLowerCase());
  const rules = STATIC_RULES[topic];

  if (rules) {
    return rules(config);
  }

  // Fallback for unknown topics
  const title = topic
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return `# ${title}

- Follow established ${topic} patterns in this project
- Use ${config.language} for all source files
`;
}

const STATIC_RULES: Record<string, (config: RulesConfig) => string> = {
  "code-style": (config) => {
    const ext = config.language === "TypeScript" ? "ts,tsx" : config.language === "Python" ? "py" : "js,jsx";
    return `---
paths:
  - "src/**/*.{${ext}}"
---

# Code Style

- Use ${config.language} for all source files
- Prefer named exports over default exports
- Keep functions under 50 lines — extract helpers when longer
- Use descriptive variable names — no single-letter names except loop indices
- Handle errors explicitly — no empty catch blocks
`;
  },

  testing: (config) => {
    const isNode = config.techStack.some((t) => /node|react|vue|express|next/i.test(t));
    const isPython = config.techStack.some((t) => /python|django|flask|fastapi/i.test(t));
    return `---
paths:
  - "**/*.test.*"
  - "**/*.spec.*"
  - "tests/**/*"
---

# Testing

- Co-locate test files next to source files (component.test.${isNode ? "ts" : isPython ? "py" : "ts"})
- Use descriptive test names that explain the expected behavior
- Test behavior, not implementation details
- Each test should be independent — no shared mutable state between tests
${isNode ? "- Use `describe` blocks to group related tests" : ""}${isPython ? "- Use pytest fixtures for shared setup" : ""}
`;
  },

  components: (config) => {
    const framework = config.techStack.find((t) => /react|vue|svelte|angular/i.test(t)) || "React";
    return `---
paths:
  - "src/components/**/*"
  - "src/pages/**/*"
---

# Components

- One component per file, filename matches component name
- Keep components focused — extract subcomponents when exceeding 150 lines
- Separate business logic from presentation (use hooks/composables)
- Props interface at the top of the file
- Event handlers prefixed with \`handle\` (handleClick, handleSubmit)
`;
  },

  "api-design": (_config) => `---
paths:
  - "src/api/**/*"
  - "src/routes/**/*"
  - "src/handlers/**/*"
---

# API Design

- Use consistent HTTP methods (GET=read, POST=create, PUT=update, DELETE=delete)
- Validate all request input at the handler level
- Return consistent error shapes: { error: string, code: string }
- Use appropriate HTTP status codes (400 client error, 500 server error)
- Keep handlers thin — extract business logic to service layer
`,

  database: (_config) => `---
paths:
  - "src/db/**/*"
  - "**/migrations/**/*"
  - "**/*.prisma"
  - "src/models/**/*"
---

# Database

- Never write raw SQL in handlers — use the ORM/query builder
- All schema changes require a migration file
- Use transactions for multi-table operations
- Index foreign keys and frequently queried columns
- Validate data at the application layer before writing to DB
`,

  typescript: (_config) => `---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# TypeScript

- Use strict mode — no \`any\` unless absolutely necessary
- Prefer \`interface\` for object shapes, \`type\` for unions and intersections
- Use \`unknown\` over \`any\` for untyped external data, then narrow
- Export types alongside their implementations
- Use \`as const\` for literal types and enums
`,

  security: (_config) => `---
paths:
  - "src/auth/**/*"
  - "src/middleware/**/*"
---

# Security

- Never log secrets, tokens, or passwords
- Validate and sanitize all user input
- Use parameterized queries — never interpolate user input into SQL
- Store secrets in environment variables, never in code
- Set appropriate CORS origins — never use wildcard in production
`,

  deployment: (_config) => `---
paths:
  - "Dockerfile"
  - "docker-compose.*"
  - ".github/**/*"
  - "*.yml"
  - "*.yaml"
---

# Deployment

- Use multi-stage Docker builds to minimize image size
- Pin dependency versions in Dockerfiles
- Never copy .env or secrets into Docker images
- CI must pass before merging to main
- Use environment variables for all environment-specific config
`,
};
