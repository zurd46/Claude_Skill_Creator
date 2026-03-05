// examples.md file generator

export function generateExamplesMd(skillName: string): string {
  const title = skillName
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return `# ${title} — Examples

This file provides usage examples for the ${title} skill.
Claude reads this file when [examples.md](./examples.md) is referenced from SKILL.md.

## Basic Usage

<!-- Add 2-3 basic examples specific to ${skillName} -->
<!-- Each example should show: context, action, expected result -->
<!--
### Example: [descriptive name]

**Context**: When you need to...

**Steps**:
1. ...
2. ...

**Result**: ...
-->

## Common Patterns

<!-- Add patterns that come up frequently for ${skillName} -->
<!--
### Pattern: [name]

**When**: [specific scenario]

**Do**:
\`\`\`
[actual code or commands]
\`\`\`

**Don't**:
\`\`\`
[anti-pattern to avoid]
\`\`\`
-->

## Edge Cases

<!-- Add non-obvious scenarios Claude should handle correctly -->
<!--
### [Edge case name]

**Scenario**: ...
**Correct approach**: ...
-->
`;
}
