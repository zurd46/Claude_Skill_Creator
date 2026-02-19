#!/usr/bin/env node
// ClaudeCodeSkillCreator - Generate perfect Claude Code project setups
import { Command } from "commander";
import { setupCommand } from "./commands/setup.js";
import { quickCreateCommand } from "./commands/quick-create.js";
import { validateCommand } from "./commands/validate.js";
import { listCommand } from "./commands/list.js";
import { renderHeader, theme, symbols } from "./utils/styles.js";

const program = new Command();

program
  .name("ccsk")
  .description("Generate perfect Claude Code project setups")
  .version("1.0.0");

// ─── Main command: new project ─────────────────────────────────
program
  .command("new")
  .description("Create a complete Claude Code project setup")
  .argument("<project>", "Project name")
  .argument("<description>", "What the project does")
  .requiredOption("-s, --stack <items>", "Tech stack (comma-separated)")
  .option("-f, --features <items>", "Key features (comma-separated)")
  .option("--skills <items>", "Skills to generate (comma-separated)")
  .option("--no-ai", "Use static templates instead of AI")
  .action(async (project: string, description: string, opts) => {
    await setupCommand({ ...opts, project, description });
  });

// ─── Add a skill to existing project ───────────────────────────
program
  .command("add")
  .description("Add a skill to an existing project")
  .argument("<project>", "Project name")
  .argument("<skill>", "Skill name")
  .argument("<description>", "What the skill does")
  .option("-t, --type <type>", "reference | task | hybrid", "hybrid")
  .option("-f, --freedom <level>", "high | medium | low", "medium")
  .option("-r, --reference", "Include reference.md")
  .option("-e, --examples", "Include examples.md")
  .option("--no-ai", "Use static templates instead of AI")
  .action(async (project: string, skill: string, description: string, opts) => {
    await quickCreateCommand({
      ...opts,
      project,
      name: skill,
      description,
      reference: opts.reference ?? true,
      examples: opts.examples ?? true,
    });
  });

// ─── Validate ──────────────────────────────────────────────────
program
  .command("validate")
  .alias("check")
  .description("Validate a skill directory")
  .argument("<path>", "Path to skill directory")
  .action(async (skillPath: string) => {
    await validateCommand(skillPath);
  });

// ─── List ──────────────────────────────────────────────────────
program
  .command("list")
  .alias("ls")
  .description("List all projects and skills")
  .argument("[project]", "Filter by project name")
  .action(async (project?: string) => {
    await listCommand(project);
  });

// ─── Help screen ───────────────────────────────────────────────
if (process.argv.length <= 2) {
  console.log(renderHeader());
  console.log("");
  console.log(`  ${theme.primary("Commands:")}`);
  console.log("");
  console.log(`    ${theme.bold("ccsk new")} ${theme.dim("<project> <description>")} ${theme.primary("-s stack")}`);
  console.log(`      Create complete project setup (CLAUDE.md + settings + rules + skills)`);
  console.log("");
  console.log(`    ${theme.bold("ccsk add")} ${theme.dim("<project> <skill> <description>")}`);
  console.log(`      Add a skill to an existing project`);
  console.log("");
  console.log(`    ${theme.bold("ccsk validate")} ${theme.dim("<path>")}`);
  console.log(`      Validate a skill directory`);
  console.log("");
  console.log(`    ${theme.bold("ccsk list")} ${theme.dim("[project]")}`);
  console.log(`      List all projects and skills`);
  console.log("");
  console.log(`  ${theme.dim("Examples:")}`);
  console.log("");
  console.log(`    ${symbols.arrow} ${theme.primary('ccsk new my-app "E-commerce platform" -s react,typescript,express,postgres')}`);
  console.log(`    ${symbols.arrow} ${theme.primary('ccsk add my-app code-review "Reviews code for best practices"')}`);
  console.log(`    ${symbols.arrow} ${theme.primary('ccsk validate projekte/my-app/.claude/skills/code-review')}`);
  console.log(`    ${symbols.arrow} ${theme.primary('ccsk list')}`);
  console.log("");
} else {
  program.parse();
}
