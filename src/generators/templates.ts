// Template definitions for different skill types and freedom levels

export interface SkillTemplate {
  type: "reference" | "task" | "hybrid";
  freedomLevel: "high" | "medium" | "low";
  sections: string[];
  description: string;
}

export const SKILL_TEMPLATES: Record<string, SkillTemplate> = {
  "reference-high": {
    type: "reference",
    freedomLevel: "high",
    sections: ["overview", "key-concepts", "guidelines"],
    description: "Reference guide with flexible usage patterns",
  },
  "reference-medium": {
    type: "reference",
    freedomLevel: "medium",
    sections: ["overview", "key-concepts", "guidelines", "patterns"],
    description: "Reference guide with recommended patterns",
  },
  "reference-low": {
    type: "reference",
    freedomLevel: "low",
    sections: ["overview", "key-concepts", "exact-procedures", "checklists"],
    description: "Reference guide with strict procedures",
  },
  "task-high": {
    type: "task",
    freedomLevel: "high",
    sections: ["goal", "approach", "considerations"],
    description: "Task-oriented skill with flexible approach",
  },
  "task-medium": {
    type: "task",
    freedomLevel: "medium",
    sections: ["goal", "workflow", "validation", "output-format"],
    description: "Task-oriented skill with structured workflow",
  },
  "task-low": {
    type: "task",
    freedomLevel: "low",
    sections: ["goal", "step-by-step", "validation-checklist", "exact-output"],
    description: "Task-oriented skill with exact step-by-step instructions",
  },
  "hybrid-high": {
    type: "hybrid",
    freedomLevel: "high",
    sections: ["overview", "when-to-use", "approach", "considerations"],
    description: "Combined reference and task skill with flexibility",
  },
  "hybrid-medium": {
    type: "hybrid",
    freedomLevel: "medium",
    sections: ["overview", "when-to-use", "workflow", "patterns", "validation"],
    description: "Combined skill with recommended workflow and patterns",
  },
  "hybrid-low": {
    type: "hybrid",
    freedomLevel: "low",
    sections: [
      "overview",
      "when-to-use",
      "step-by-step",
      "validation-checklist",
      "exact-output",
    ],
    description: "Combined skill with strict procedures",
  },
};

export function getTemplate(
  type: string,
  freedomLevel: string
): SkillTemplate {
  const key = `${type}-${freedomLevel}`;
  return SKILL_TEMPLATES[key] ?? SKILL_TEMPLATES["hybrid-medium"]!;
}

// Section content generators — these are static fallbacks when AI is not available.
// They provide structural guidance that users should customize for their project.
export const SECTION_TEMPLATES: Record<string, (name: string) => string> = {
  overview: (name) => {
    const readable = formatName(name);
    return `## Overview

${readable} provides Claude with domain-specific knowledge and workflows for this task.
Invoke this skill when working on ${name}-related changes.
`;
  },

  "key-concepts": (name) => `## Key Concepts

<!-- Add the core concepts specific to ${name} that Claude needs to understand -->
<!-- Example: key abstractions, domain terms, architectural decisions -->
`,

  guidelines: (name) => `## Guidelines

<!-- Add specific, actionable guidelines for ${name} -->
<!-- Each guideline should be verifiable — "Use X" not "Be careful with Y" -->
`,

  patterns: (name) => `## Patterns

<!-- Add recommended patterns for ${name} with when to use each -->
<!-- Include actual code snippets or command examples -->
`,

  "exact-procedures": (name) => `## Procedures

<!-- Add step-by-step procedures for ${name} with exact commands -->
`,

  checklists: (_name) => `## Checklists

### Pre-execution
- [ ] Read relevant source files to understand current state
- [ ] Check for existing tests that cover this area
- [ ] Verify no uncommitted changes that might conflict

### Post-execution
- [ ] All tests pass
- [ ] No linting errors introduced
- [ ] Changes are minimal and focused
`,

  goal: (name) => {
    const readable = formatName(name);
    return `## Goal

${readable} ensures consistent, high-quality results for this type of task.
`;
  },

  approach: (_name) => `## Approach

1. Read the relevant source files first to understand current state
2. Evaluate the options available given the project's conventions
3. Implement the minimal change needed
4. Verify the result with tests and linting
`,

  considerations: (_name) => `## Considerations

- **Scope**: Make the smallest change that solves the problem
- **Consistency**: Follow existing patterns in the codebase
- **Testing**: Add or update tests for any behavior changes
`,

  workflow: (_name) => `## Workflow

1. **Analyze** — Read relevant files, understand the current state
2. **Plan** — Identify the approach, check for edge cases
3. **Execute** — Implement changes, keeping diffs minimal
4. **Validate** — Run tests, check for regressions
`,

  validation: (_name) => `## Validation

After completing the task:

1. Run the test suite and confirm all tests pass
2. Run the linter and fix any new warnings
3. Review the diff — remove any unrelated changes
`,

  "output-format": (_name) => `## Output Format

<!-- Define the exact output format required for this task -->
`,

  "step-by-step": (_name) => `## Step-by-Step Instructions

<!-- Add exact step-by-step instructions with specific commands -->
<!-- Each step should have a clear, verifiable outcome -->
`,

  "validation-checklist": (_name) => `## Validation Checklist

- [ ] Implementation matches the requirements
- [ ] All tests pass (run test command)
- [ ] No linting errors (run lint command)
- [ ] No unrelated changes in the diff
`,

  "exact-output": (_name) => `## Exact Output Template

<!-- Define the exact output format that must be followed -->
`,

  "when-to-use": (name) => {
    const readable = formatName(name);
    return `## When to Use

Use ${readable} when:

- Working on ${name}-related tasks in this project
- Making changes that affect ${name} functionality

Do NOT use when the task is unrelated to ${name}.
`;
  },
};

function formatName(name: string): string {
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
