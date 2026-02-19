// .claude/settings.json generator
import { chat, type ChatMessage } from "../utils/openrouter.js";
import { isConfigured } from "../utils/openrouter.js";

export interface SettingsConfig {
  projectName: string;
  techStack: string[];
  language: string;
  features: string[];
}

const SYSTEM_PROMPT = `You are an expert at configuring Claude Code settings.json files.

Output ONLY valid JSON. No explanations, no code fences.

The settings.json configures Claude Code behavior for a project:
- permissions: allow/deny specific tool patterns
- hooks: PreToolUse/PostToolUse shell commands
- env: environment variables

Follow this schema:
{
  "permissions": {
    "allow": ["pattern1", "pattern2"],
    "deny": ["pattern1"]
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

Permission patterns use: Bash(pattern), Read(pattern), Write(pattern), Edit(pattern), Glob(pattern), Grep(pattern)
Use glob patterns in parentheses, e.g.: Bash(npm run *), Read(.env*)`;

function buildSettingsPrompt(config: SettingsConfig): string {
  return `Create a .claude/settings.json for:

Project: ${config.projectName}
Tech Stack: ${config.techStack.join(", ")}
Language: ${config.language}
Features: ${config.features.join(", ")}

Include:
1. Sensible permission allow rules for this tech stack (npm/yarn/pnpm commands, test runners, build tools)
2. Deny rules for dangerous operations (rm -rf, dropping databases, etc.)
3. PostToolUse hooks for linting/formatting after file edits (if relevant tools exist in the stack)
4. Protect sensitive files (.env, credentials)

Be SPECIFIC to this tech stack. Output valid JSON only.`;
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
  const isNode = config.techStack.some((t) =>
    /node|express|next|react|vue|angular|svelte|npm|yarn|pnpm|bun/i.test(t)
  );
  const isPython = config.techStack.some((t) =>
    /python|django|flask|fastapi|pip|poetry/i.test(t)
  );

  const allowRules: string[] = [];
  const denyRules: string[] = ["Read(.env*)", "Read(*credentials*)", "Read(*secret*)"];

  if (isNode) {
    allowRules.push(
      "Bash(npm run *)",
      "Bash(npm test *)",
      "Bash(npm install *)",
      "Bash(npx *)",
      "Bash(node *)"
    );
  }

  if (isPython) {
    allowRules.push(
      "Bash(python *)",
      "Bash(pip install *)",
      "Bash(pytest *)",
      "Bash(poetry *)"
    );
  }

  const settings: Record<string, unknown> = {
    permissions: {
      allow: allowRules,
      deny: denyRules,
    },
  };

  return JSON.stringify(settings, null, 2) + "\n";
}
