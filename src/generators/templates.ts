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

// Section content generators
export const SECTION_TEMPLATES: Record<string, (name: string) => string> = {
  overview: (name) =>
    `## Overview\n\nProvide a high-level overview of what ${name} does and the problems it solves.\n`,

  "key-concepts": (_name) =>
    `## Key Concepts\n\n- **Concept 1**: Description of the first key concept\n- **Concept 2**: Description of the second key concept\n`,

  guidelines: (_name) =>
    `## Guidelines\n\n- Guideline for common scenarios\n- Guideline for edge cases\n- Guideline for error handling\n`,

  patterns: (_name) =>
    `## Patterns\n\n### Pattern: [Name]\n\n**When to use**: Describe the scenario\n\n**Approach**:\n1. First step\n2. Second step\n3. Third step\n`,

  "exact-procedures": (_name) =>
    `## Procedures\n\n### Procedure 1: [Name]\n\n\`\`\`\nStep 1: [Exact action]\nStep 2: [Exact action]\nStep 3: [Exact action]\n\`\`\`\n`,

  checklists: (_name) =>
    `## Checklists\n\n### Pre-execution Checklist\n- [ ] Verify prerequisite 1\n- [ ] Verify prerequisite 2\n\n### Post-execution Checklist\n- [ ] Validate output 1\n- [ ] Validate output 2\n`,

  goal: (name) =>
    `## Goal\n\nDescribe the primary objective of ${name} and the expected outcome.\n`,

  approach: (_name) =>
    `## Approach\n\nDescribe the general approach. Claude can adapt this based on context:\n\n- Consider the current state of the codebase\n- Evaluate multiple options before choosing\n- Prioritize maintainability and clarity\n`,

  considerations: (_name) =>
    `## Considerations\n\n- **Performance**: Consider impact on performance\n- **Compatibility**: Ensure backward compatibility\n- **Testing**: Include appropriate test coverage\n`,

  workflow: (_name) =>
    `## Workflow\n\n1. **Analyze** - Understand the current state\n2. **Plan** - Design the approach\n3. **Execute** - Implement the changes\n4. **Validate** - Verify the results\n`,

  validation: (_name) =>
    `## Validation\n\nAfter completing the task, verify:\n\n1. Output matches expected format\n2. No errors or warnings\n3. All edge cases handled\n`,

  "output-format": (_name) =>
    `## Output Format\n\nThe expected output should follow this structure:\n\n\`\`\`\n[Describe the expected output format]\n\`\`\`\n`,

  "step-by-step": (_name) =>
    `## Step-by-Step Instructions\n\n### Step 1: [Name]\n\nExact instructions for step 1.\n\n### Step 2: [Name]\n\nExact instructions for step 2.\n\n### Step 3: [Name]\n\nExact instructions for step 3.\n`,

  "validation-checklist": (_name) =>
    `## Validation Checklist\n\n- [ ] Step 1 completed successfully\n- [ ] Output matches expected format exactly\n- [ ] No side effects introduced\n- [ ] All tests pass\n`,

  "exact-output": (_name) =>
    `## Exact Output Template\n\n\`\`\`\n[Provide the exact output format that must be followed]\n\`\`\`\n`,

  "when-to-use": (name) =>
    `## When to Use\n\nUse ${name} when:\n\n- Condition 1 applies\n- Condition 2 applies\n\nDo NOT use when:\n\n- Alternative condition 1\n- Alternative condition 2\n`,
};
