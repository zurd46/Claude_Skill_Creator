// Full skill validation engine
import fse from "fs-extra";
import * as path from "path";
import {
  validateName,
  validateDescription,
  validateSkillMdBody,
  validateFileReferences,
  validateFrontmatter,
  getNameWarnings,
  getDescriptionWarnings,
  type ValidationResult,
  type ValidationError,
  type ValidationWarning,
} from "./rules.js";

export async function validateSkillDirectory(
  skillPath: string
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check directory exists
  if (!(await fse.pathExists(skillPath))) {
    return {
      valid: false,
      errors: [
        {
          field: "directory",
          message: `Skill directory not found: ${skillPath}`,
        },
      ],
      warnings: [],
    };
  }

  // Check SKILL.md exists
  const skillMdPath = path.join(skillPath, "SKILL.md");
  if (!(await fse.pathExists(skillMdPath))) {
    return {
      valid: false,
      errors: [
        {
          field: "SKILL.md",
          message: "Required file SKILL.md not found",
          suggestion: "Every skill must have a SKILL.md file as its entry point",
        },
      ],
      warnings: [],
    };
  }

  // Read and parse SKILL.md
  const content = await fse.readFile(skillMdPath, "utf-8");

  // Parse frontmatter
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) {
    errors.push({
      field: "frontmatter",
      message: "Missing YAML frontmatter (--- delimiters)",
      suggestion:
        "Add YAML frontmatter at the top of SKILL.md between --- markers",
    });
  } else {
    const fmResult = validateFrontmatter(fmMatch[1]);
    errors.push(...fmResult.errors);

    if (fmResult.name) {
      errors.push(...validateName(fmResult.name));
      warnings.push(...getNameWarnings(fmResult.name));
    }

    if (fmResult.description) {
      errors.push(...validateDescription(fmResult.description));
      warnings.push(...getDescriptionWarnings(fmResult.description));
    }
  }

  // Validate body
  const body = fmMatch ? content.substring(fmMatch[0].length) : content;
  errors.push(...validateSkillMdBody(body));
  errors.push(...validateFileReferences(body));

  // Check for referenced files
  const fileRefRegex = /\[.*?\]\(\.\/(.*?)\)/g;
  let match;
  while ((match = fileRefRegex.exec(body)) !== null) {
    const refFile = match[1];
    const refPath = path.join(skillPath, refFile);
    if (!(await fse.pathExists(refPath))) {
      warnings.push({
        field: "file reference",
        message: `Referenced file not found: ${refFile}`,
        suggestion: `Create the file ${refFile} or remove the reference`,
      });
    }
  }

  // Check for common anti-patterns
  if (content.includes("\\\\") || /[A-Z]:\\/.test(content)) {
    errors.push({
      field: "paths",
      message: "Windows-style paths detected",
      suggestion: "Use forward slashes (/) for all file paths",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateSkillConfig(config: {
  name: string;
  description: string;
}): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  errors.push(...validateName(config.name));
  errors.push(...validateDescription(config.description));
  warnings.push(...getNameWarnings(config.name));
  warnings.push(...getDescriptionWarnings(config.description));

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
