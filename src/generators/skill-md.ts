// SKILL.md file generator
import { getTemplate, SECTION_TEMPLATES } from "./templates.js";
import type { SkillConfig } from "../validation/schemas.js";

export function generateSkillMd(config: SkillConfig): string {
  const template = getTemplate(config.type, config.freedomLevel);

  // Build YAML frontmatter
  const frontmatter = [
    "---",
    `name: ${config.name}`,
    `description: ${config.description}`,
    "---",
  ].join("\n");

  // Build title
  const title = `# ${formatTitle(config.name)}`;

  // Build sections from template
  const sections = template.sections
    .map((sectionKey) => {
      const generator = SECTION_TEMPLATES[sectionKey];
      if (generator) {
        return generator(config.name);
      }
      return `## ${formatSectionTitle(sectionKey)}\n\nAdd content here.\n`;
    })
    .join("\n");

  // Add custom instructions if provided
  const customSection = config.customInstructions
    ? `\n## Additional Instructions\n\n${config.customInstructions}\n`
    : "";

  // Add file references if supporting files are included
  const references = buildReferences(config);

  return [frontmatter, "", title, "", sections, customSection, references]
    .filter(Boolean)
    .join("\n")
    .trim() + "\n";
}

function buildReferences(config: SkillConfig): string {
  const refs: string[] = [];

  if (config.includeReference) {
    refs.push(
      "## Reference\n\nSee [reference.md](./reference.md) for detailed API and configuration reference.\n"
    );
  }

  if (config.includeExamples) {
    refs.push(
      "## Examples\n\nSee [examples.md](./examples.md) for usage examples and common patterns.\n"
    );
  }

  return refs.join("\n");
}

function formatTitle(name: string): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatSectionTitle(key: string): string {
  return key
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
