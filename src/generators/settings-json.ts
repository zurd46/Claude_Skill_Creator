// .claude/settings.json generator
import { chat, type ChatMessage } from "../utils/openrouter.js";
import { isConfigured } from "../utils/openrouter.js";

export interface SettingsConfig {
  projectName: string;
  techStack: string[];
  language: string;
  features: string[];
}

const SYSTEM_PROMPT = `You are an expert at configuring Claude Code .claude/settings.json files.

Output ONLY valid JSON. No explanations, no code fences.

CONTEXT: This is a PROJECT-LEVEL settings.json (.claude/settings.json) that is checked into git and shared with the team. It should contain ONLY project-specific permissions — not personal preferences.

The settings.json schema:
{
  "permissions": {
    "allow": ["pattern1"],   // Allow without asking
    "deny": ["pattern1"]     // Block completely
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{ "type": "command", "command": "cmd" }]
      }
    ]
  }
}

Permission pattern format: ToolName(glob_pattern)
- Bash(npm run *), Bash(npx *), Bash(git status)
- Read, Write, Edit, Glob, Grep (for file access patterns)

RULES:
1. Only allow commands that are SAFE and commonly needed for this stack
2. Do NOT deny Read(.env*) — Claude needs to read .env.example and .env.local for project setup
3. DO deny Write(.env) to prevent overwriting secrets
4. Hooks are DETERMINISTIC — use them for actions that must happen every time (linting, formatting)
5. Only add hooks if the stack has actual linter/formatter tools (eslint, prettier, black, ruff, etc.)
6. Keep it minimal — don't over-restrict Claude, that defeats the purpose`;

function buildSettingsPrompt(config: SettingsConfig): string {
  return `Create a .claude/settings.json for:

Project: ${config.projectName}
Tech Stack: ${config.techStack.join(", ")}
Language: ${config.language}
Features: ${config.features.join(", ")}

Requirements:
1. Allow standard dev commands for this stack (build, test, dev, lint)
2. Deny destructive operations (rm -rf /, DROP DATABASE, etc.)
3. Deny writing to secret files (Write(.env), Write(*credentials*))
4. If the stack has linters/formatters, add PostToolUse hooks to auto-format after Write|Edit
5. Keep permissions minimal — only add what's genuinely needed

Output valid JSON only.`;
}

export async function generateSettingsWithAI(config: SettingsConfig): Promise<string> {
  if (!isConfigured()) {
    return generateSettingsStatic(config);
  }

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildSettingsPrompt(config) },
  ];

  const content = await chat(messages, { temperature: 0.2, maxTokens: 2048 });

  // Extract JSON from response (handle if wrapped in code fences)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      // Validate it's valid JSON
      JSON.parse(jsonMatch[0]);
      return JSON.stringify(JSON.parse(jsonMatch[0]), null, 2) + "\n";
    } catch {
      // Fall through to static
    }
  }

  return generateSettingsStatic(config);
}

export function generateSettingsStatic(config: SettingsConfig): string {
  const stackLower = config.techStack.map((t) => t.toLowerCase());

  const isNode = stackLower.some((t) =>
    /node|express|next|react|vue|angular|svelte|npm|yarn|pnpm|bun/.test(t)
  );
  const isPython = stackLower.some((t) =>
    /python|django|flask|fastapi|pip|poetry/.test(t)
  );
  const usesYarn = stackLower.includes("yarn");
  const usesPnpm = stackLower.includes("pnpm");
  const usesBun = stackLower.includes("bun");

  const allowRules: string[] = [];
  const denyRules: string[] = [
    "Write(.env)",
    "Write(*credentials*)",
    "Write(*secret*)",
  ];

  if (isNode) {
    if (usesBun) {
      allowRules.push("Bash(bun run *)", "Bash(bun test *)", "Bash(bun install *)", "Bash(bunx *)");
    } else if (usesPnpm) {
      allowRules.push("Bash(pnpm run *)", "Bash(pnpm test *)", "Bash(pnpm install *)", "Bash(pnpm dlx *)");
    } else if (usesYarn) {
      allowRules.push("Bash(yarn *)", "Bash(yarn test *)", "Bash(yarn add *)");
    } else {
      allowRules.push("Bash(npm run *)", "Bash(npm test *)", "Bash(npx *)");
    }
  }

  if (isPython) {
    allowRules.push("Bash(python *)", "Bash(pytest *)", "Bash(pip install *)");
    if (stackLower.includes("poetry")) allowRules.push("Bash(poetry *)");
    if (stackLower.includes("ruff") || stackLower.includes("black")) {
      allowRules.push("Bash(ruff *)", "Bash(black *)");
    }
  }

  allowRules.push("Bash(git status)", "Bash(git diff *)", "Bash(git log *)");

  const settings: Record<string, unknown> = {
    permissions: {
      allow: allowRules,
      deny: denyRules,
    },
  };

  // Add PostToolUse hook for formatting if stack has formatter
  const hasEslint = stackLower.some((t) => /eslint|next|react|vue|angular/.test(t));
  const hasPrettier = stackLower.some((t) => /prettier/.test(t));
  const hasBlack = stackLower.some((t) => /black|ruff/.test(t));

  if (hasEslint || hasPrettier || hasBlack) {
    const formatCmd = hasBlack
      ? "ruff format $FILE_PATH"
      : hasPrettier
        ? "npx prettier --write $FILE_PATH"
        : "npx eslint --fix $FILE_PATH";

    (settings as Record<string, unknown>).hooks = {
      PostToolUse: [
        {
          matcher: "Write|Edit",
          hooks: [{ type: "command", command: formatCmd }],
        },
      ],
    };
  }

  return JSON.stringify(settings, null, 2) + "\n";
}
