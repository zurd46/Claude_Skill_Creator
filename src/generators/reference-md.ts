// reference.md file generator

export function generateReferenceMd(skillName: string): string {
  const title = skillName
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return `# ${title} — Reference

This file provides detailed reference material for the ${title} skill.
Claude reads this file when [reference.md](./reference.md) is referenced from SKILL.md.

## Configuration

<!-- Add configuration options specific to ${skillName} -->
<!-- Use tables for structured data: -->
<!--
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
-->

## Key Files

<!-- List the important files Claude should know about for this skill -->
<!-- Example: -->
<!-- - \`src/auth/middleware.ts\` — Authentication middleware -->
<!-- - \`src/config/auth.ts\` — Auth configuration -->

## Common Commands

<!-- Add commands relevant to this skill -->
<!-- Example: -->
<!-- \`\`\`bash -->
<!-- npm run test:auth   # Run auth-related tests -->
<!-- \`\`\` -->

## Troubleshooting

<!-- Add common issues and their resolutions -->
<!-- Example: -->
<!-- | Issue | Cause | Fix | -->
<!-- |-------|-------|-----| -->
`;
}
