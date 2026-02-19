// Quick create command - non-interactive skill creation via CLI args
import { generateSkillMd } from "../generators/skill-md.js";
import { generateReferenceMd } from "../generators/reference-md.js";
import { generateExamplesMd } from "../generators/examples-md.js";
import {
  generateSkillMdWithAI,
  generateReferenceMdWithAI,
  generateExamplesMdWithAI,
} from "../generators/ai-generator.js";
import { isConfigured } from "../utils/openrouter.js";
import { writeSkillFile, ensureProjectExists, skillExists } from "../utils/fs.js";
import { validateSkillConfig } from "../validation/validator.js";
import { Spinner } from "../utils/animations.js";
import { renderHeader, theme, symbols } from "../utils/styles.js";
import type { SkillConfig } from "../validation/schemas.js";

interface QuickCreateOptions {
  project: string;
  name: string;
  description: string;
  type?: "reference" | "task" | "hybrid";
  freedom?: "high" | "medium" | "low";
  reference?: boolean;
  examples?: boolean;
  noAi?: boolean;
}

export async function quickCreateCommand(opts: QuickCreateOptions): Promise<void> {
  console.log(renderHeader());
  console.log("");

  // Validate inputs
  const validation = validateSkillConfig({
    name: opts.name,
    description: opts.description,
  });

  if (!validation.valid) {
    console.log(`${symbols.cross} ${theme.error("Validation failed:")}`);
    for (const err of validation.errors) {
      console.log(`  ${symbols.cross} ${theme.bold(err.field)}: ${err.message}`);
      if (err.suggestion) {
        console.log(`    ${symbols.arrow} ${theme.dim(err.suggestion)}`);
      }
    }
    process.exitCode = 1;
    return;
  }

  // Show warnings
  for (const warn of validation.warnings) {
    console.log(`${symbols.warning} ${theme.warning(warn.message)}`);
    if (warn.suggestion) {
      console.log(`  ${symbols.arrow} ${theme.dim(warn.suggestion)}`);
    }
  }

  const config: SkillConfig = {
    name: opts.name,
    description: opts.description,
    type: opts.type ?? "hybrid",
    freedomLevel: opts.freedom ?? "medium",
    includeReference: opts.reference ?? false,
    includeExamples: opts.examples ?? false,
    includeScripts: false,
  };

  // Check if skill already exists
  if (await skillExists(opts.project, opts.name)) {
    console.log(`${symbols.cross} ${theme.error(`Skill "${opts.name}" already exists in project "${opts.project}"`)}`);
    process.exitCode = 1;
    return;
  }

  const useAI = !opts.noAi && isConfigured();

  if (useAI) {
    console.log(`${symbols.info} ${theme.info("Using AI to generate skill content...")}`);
  } else if (!opts.noAi) {
    console.log(`${symbols.warning} ${theme.warning("No OpenRouter API key found. Using static templates.")}`);
    console.log(`  ${symbols.arrow} ${theme.dim("Add OPENROUTER_API_KEY to .env for AI-generated content")}`);
  }
  console.log("");

  await ensureProjectExists(opts.project);

  // Check if skill already exists
  if (await skillExists(opts.project, opts.name)) {
    console.log(`${symbols.cross} ${theme.error(`Skill "${opts.name}" already exists`)}`);
    process.exitCode = 1;
    return;
  }

  try {
    // Generate SKILL.md
    const skillSpinner = new Spinner(`Generating ${theme.primary("SKILL.md")}...`);
    skillSpinner.start();
    const skillMd = useAI
      ? await generateSkillMdWithAI(config)
      : generateSkillMd(config);
    await writeSkillFile(opts.project, opts.name, "SKILL.md", skillMd);
    skillSpinner.succeed(`Created ${theme.primary("SKILL.md")}`);

    // Generate reference.md
    if (config.includeReference) {
      const refSpinner = new Spinner(`Generating ${theme.dim("reference.md")}...`);
      refSpinner.start();
      const refMd = useAI
        ? await generateReferenceMdWithAI(config)
        : generateReferenceMd(opts.name);
      await writeSkillFile(opts.project, opts.name, "reference.md", refMd);
      refSpinner.succeed(`Created ${theme.dim("reference.md")}`);
    }

    // Generate examples.md
    if (config.includeExamples) {
      const exSpinner = new Spinner(`Generating ${theme.dim("examples.md")}...`);
      exSpinner.start();
      const exMd = useAI
        ? await generateExamplesMdWithAI(config)
        : generateExamplesMd(opts.name);
      await writeSkillFile(opts.project, opts.name, "examples.md", exMd);
      exSpinner.succeed(`Created ${theme.dim("examples.md")}`);
    }

    console.log("");
    console.log(`${symbols.tick} ${theme.success("Skill created successfully!")}`);
    console.log(`  ${symbols.arrow} ${theme.dim(`projekte/${opts.project}/skills/${opts.name}/`)}`);
  } catch (err) {
    console.log(`\n${symbols.cross} ${theme.error(`Failed: ${err instanceof Error ? err.message : String(err)}`)}`);
    process.exitCode = 1;
  }
}
