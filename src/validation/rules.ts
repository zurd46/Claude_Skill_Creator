// Individual validation rules for Claude Agent Skills
// Based on: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  line?: number;
  suggestion?: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

const RESERVED_WORDS = [
  "anthropic",
  "claude",
  "system",
  "admin",
  "root",
  "default",
  "internal",
];

const XML_TAG_REGEX = /<\/?[a-zA-Z][a-zA-Z0-9]*[^>]*>/;
const NAME_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function validateName(name: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!name || name.trim().length === 0) {
    errors.push({
      field: "name",
      message: "Skill name is required",
      suggestion: "Provide a descriptive name like 'processing-pdfs'",
    });
    return errors;
  }

  if (name.length > 64) {
    errors.push({
      field: "name",
      message: `Name exceeds 64 characters (got ${name.length})`,
      suggestion: "Shorten the name to 64 characters or less",
    });
  }

  if (!NAME_REGEX.test(name)) {
    errors.push({
      field: "name",
      message:
        "Name must contain only lowercase letters, numbers, and hyphens",
      suggestion:
        'Use format like "my-skill-name" (no uppercase, spaces, or special chars)',
    });
  }

  for (const reserved of RESERVED_WORDS) {
    if (name.toLowerCase().includes(reserved)) {
      errors.push({
        field: "name",
        message: `Name contains reserved word "${reserved}"`,
        suggestion: `Remove or replace "${reserved}" in the skill name`,
      });
    }
  }

  if (XML_TAG_REGEX.test(name)) {
    errors.push({
      field: "name",
      message: "Name must not contain XML tags",
      suggestion: "Remove any XML/HTML tags from the name",
    });
  }

  return errors;
}

export function validateDescription(description: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!description || description.trim().length === 0) {
    errors.push({
      field: "description",
      message: "Description is required",
      suggestion:
        "Write a clear description of what the skill does and when to use it",
    });
    return errors;
  }

  if (description.length > 1024) {
    errors.push({
      field: "description",
      message: `Description exceeds 1024 characters (got ${description.length})`,
      suggestion: "Shorten the description to 1024 characters or less",
    });
  }

  if (XML_TAG_REGEX.test(description)) {
    errors.push({
      field: "description",
      message: "Description must not contain XML tags",
      suggestion: "Remove any XML/HTML tags from the description",
    });
  }

  // Check for third person (should not start with "I", "You", "We")
  const firstWord = description.trim().split(/\s+/)[0]?.toLowerCase();
  if (firstWord && ["i", "you", "we", "my", "your", "our"].includes(firstWord)) {
    errors.push({
      field: "description",
      message: "Description should be written in third person",
      suggestion:
        'Start with a verb like "Generates...", "Validates...", "Processes..."',
    });
  }

  return errors;
}

export function validateSkillMdBody(content: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const lines = content.split("\n");

  if (lines.length > 500) {
    errors.push({
      field: "SKILL.md body",
      message: `SKILL.md exceeds 500 lines (got ${lines.length})`,
      suggestion:
        "Move detailed content to separate reference files and use file references",
    });
  }

  return errors;
}

export function validateFileReferences(content: string): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check for nested file references (more than one level deep)
  const refRegex = /\[.*?\]\(\.\/.*?\/.*?\/.*?\)/g;
  const matches = content.match(refRegex);
  if (matches) {
    for (const match of matches) {
      errors.push({
        field: "file references",
        message: `Nested file reference detected: ${match}`,
        line: content.substring(0, content.indexOf(match)).split("\n").length,
        suggestion: "File references must be one level deep only (e.g., ./reference.md)",
      });
    }
  }

  // Check for Windows-style paths
  if (content.includes("\\")) {
    const windowsPathRegex = /[a-zA-Z]:\\|\\[a-zA-Z]/;
    if (windowsPathRegex.test(content)) {
      errors.push({
        field: "file paths",
        message: "Windows-style backslash paths detected",
        suggestion: "Use forward slashes (/) for all file paths",
      });
    }
  }

  return errors;
}

export function validateFrontmatter(
  frontmatter: string
): { name?: string; description?: string; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  let name: string | undefined;
  let description: string | undefined;

  const lines = frontmatter.split("\n");
  for (const line of lines) {
    const nameMatch = line.match(/^name:\s*(.+)$/);
    if (nameMatch) {
      name = nameMatch[1].trim().replace(/^["']|["']$/g, "");
    }
    const descMatch = line.match(/^description:\s*(.+)$/);
    if (descMatch) {
      description = descMatch[1].trim().replace(/^["']|["']$/g, "");
    }
  }

  if (!name) {
    errors.push({
      field: "frontmatter",
      message: 'Missing required "name" field in YAML frontmatter',
      suggestion: "Add 'name: your-skill-name' to the frontmatter",
    });
  }

  if (!description) {
    errors.push({
      field: "frontmatter",
      message: 'Missing required "description" field in YAML frontmatter',
      suggestion: "Add 'description: What this skill does' to the frontmatter",
    });
  }

  return { name, description, errors };
}

export function getNameWarnings(name: string): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  // Recommend gerund form
  const gerundEndings = [
    "ing",
    "ting",
    "ning",
    "ring",
    "ling",
    "ding",
    "sing",
  ];
  const parts = name.split("-");
  const hasGerund = parts.some((p) =>
    gerundEndings.some((e) => p.endsWith(e))
  );

  if (!hasGerund && parts.length > 1) {
    warnings.push({
      field: "name",
      message: "Consider using gerund form for the skill name",
      suggestion: `e.g., "${parts[0]}ing-${parts.slice(1).join("-")}" instead of "${name}"`,
    });
  }

  return warnings;
}

export function getDescriptionWarnings(
  description: string
): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  if (description.length < 20) {
    warnings.push({
      field: "description",
      message: "Description seems too short",
      suggestion:
        "Add more detail about what the skill does AND when to use it",
    });
  }

  // Check if description mentions when to use the skill
  const whenKeywords = [
    "when",
    "use",
    "trigger",
    "invoke",
    "activate",
    "for",
    "helps",
  ];
  const hasWhen = whenKeywords.some((kw) =>
    description.toLowerCase().includes(kw)
  );
  if (!hasWhen) {
    warnings.push({
      field: "description",
      message: "Description should explain when to use the skill",
      suggestion:
        'Add context like "Use when..." or "Helps with..." to the description',
    });
  }

  return warnings;
}
