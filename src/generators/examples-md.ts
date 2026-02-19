// examples.md file generator

export function generateExamplesMd(skillName: string): string {
  const title = skillName
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return `# ${title} - Examples

## Table of Contents

- [Basic Usage](#basic-usage)
- [Common Patterns](#common-patterns)
- [Advanced Usage](#advanced-usage)
- [Edge Cases](#edge-cases)

## Basic Usage

### Example 1: Simple Case

**Input**:
\`\`\`
[Describe the input scenario]
\`\`\`

**Expected Output**:
\`\`\`
[Describe the expected output]
\`\`\`

**Notes**: Additional context about this example.

### Example 2: Another Common Case

**Input**:
\`\`\`
[Describe the input scenario]
\`\`\`

**Expected Output**:
\`\`\`
[Describe the expected output]
\`\`\`

## Common Patterns

### Pattern: [Name]

**When to use**: Describe the scenario where this pattern applies.

**Example**:
\`\`\`
[Show the pattern in action]
\`\`\`

### Pattern: [Name]

**When to use**: Describe the scenario.

**Example**:
\`\`\`
[Show the pattern in action]
\`\`\`

## Advanced Usage

### Complex Scenario

**Context**: Describe the complex scenario.

**Input**:
\`\`\`
[Complex input]
\`\`\`

**Step-by-step**:
1. First, handle [aspect 1]
2. Then, process [aspect 2]
3. Finally, validate [aspect 3]

**Expected Output**:
\`\`\`
[Expected result]
\`\`\`

## Edge Cases

### Edge Case 1: Empty Input

**Input**: (empty)

**Expected Behavior**: Describe what should happen.

### Edge Case 2: Maximum Size

**Input**: Very large input

**Expected Behavior**: Describe what should happen.
`;
}
