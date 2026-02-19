// reference.md file generator

export function generateReferenceMd(skillName: string): string {
  const title = skillName
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return `# ${title} - Reference

## Table of Contents

- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Parameters](#parameters)
- [Error Codes](#error-codes)

## Configuration

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| \`param1\` | string | \`""\` | Description of parameter 1 |
| \`param2\` | number | \`0\` | Description of parameter 2 |
| \`param3\` | boolean | \`false\` | Description of parameter 3 |

## API Reference

### Function/Endpoint 1

**Description**: What this function does.

**Parameters**:
- \`input\` (required): Description of the input
- \`options\` (optional): Additional options

**Returns**: Description of the return value

**Example**:
\`\`\`
// Example usage
\`\`\`

### Function/Endpoint 2

**Description**: What this function does.

## Parameters

### Required Parameters

- **\`name\`**: The name used for identification
- **\`type\`**: The type of operation to perform

### Optional Parameters

- **\`verbose\`**: Enable detailed output (default: false)
- **\`format\`**: Output format - "json" | "text" (default: "text")

## Error Codes

| Code | Message | Resolution |
|------|---------|------------|
| E001 | Invalid input | Check input format matches expected schema |
| E002 | Not found | Verify the resource exists before accessing |
| E003 | Permission denied | Check access permissions |
`;
}
