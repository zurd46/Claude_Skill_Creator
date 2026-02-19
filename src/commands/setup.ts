// Setup command - generates complete Claude Code project configuration
import fse from "fs-extra";
import * as path from "path";
import { generateClaudeMdWithAI, type ProjectConfig } from "../generators/claude-md.js";
import { generateSettingsWithAI, type SettingsConfig } from "../generators/settings-json.js";
import { generateRulesWithAI, type RulesConfig } from "../generators/rules.js";
import {
  generateSkillMdWithAI,
  generateReferenceMdWithAI,
  generateExamplesMdWithAI,
} from "../generators/ai-generator.js";
import { generateSkillMd } from "../generators/skill-md.js";
import { isConfigured } from "../utils/openrouter.js";
import { Spinner, sleep } from "../utils/animations.js";
import { renderHeader, theme, symbols, divider } from "../utils/styles.js";
import type { SkillConfig } from "../validation/schemas.js";

export interface SetupOptions {
  project: string;
  description: string;
  stack: string;
  language?: string;
  features?: string;
  skills?: string;
  noAi?: boolean;
}

function parseCommaSeparated(value: string | undefined): string[] {
  if (!value) return [];
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

export async function setupCommand(opts: SetupOptions): Promise<void> {
  console.log(renderHeader());
  console.log("");

  const techStack = parseCommaSeparated(opts.stack);
  const features = parseCommaSeparated(opts.features);
  const skillNames = parseCommaSeparated(opts.skills);
  const language = opts.language ?? detectLanguage(techStack);
  const useAI = !opts.noAi && isConfigured();

  if (techStack.length === 0) {
    console.log(`${symbols.cross} ${theme.error("Tech stack is required (--stack)")}`);
    process.exitCode = 1;
    return;
  }

  console.log(`${theme.bold(theme.primary("Project Setup"))}`);
  console.log(`  ${theme.dim("Project:")}     ${opts.project}`);
  console.log(`  ${theme.dim("Description:")} ${opts.description}`);
  console.log(`  ${theme.dim("Stack:")}       ${techStack.join(", ")}`);
  console.log(`  ${theme.dim("Language:")}    ${language}`);
  if (features.length) console.log(`  ${theme.dim("Features:")}    ${features.join(", ")}`);
  if (skillNames.length) console.log(`  ${theme.dim("Skills:")}      ${skillNames.join(", ")}`);
  console.log(`  ${theme.dim("AI:")}          ${useAI ? theme.success("OpenRouter") : theme.warning("Static templates")}`);
  console.log("");
  console.log(divider(56));
  console.log("");

  const projectPath = path.join(process.cwd(), "projekte", opts.project);
  const claudeDir = path.join(projectPath, ".claude");

  // Create directory structure
  await fse.ensureDir(path.join(claudeDir, "skills"));
  await fse.ensureDir(path.join(claudeDir, "rules"));

  const createdFiles: string[] = [];

  // 1. Generate CLAUDE.md
  const claudeMdSpinner = new Spinner(`Generating ${theme.primary("CLAUDE.md")}...`);
  claudeMdSpinner.start();
  try {
    const projectConfig: ProjectConfig = {
      projectName: opts.project,
      description: opts.description,
      techStack,
      language,
      features,
    };
    const claudeMd = await generateClaudeMdWithAI(projectConfig);
    await fse.writeFile(path.join(projectPath, "CLAUDE.md"), claudeMd);
    claudeMdSpinner.succeed(`Created ${theme.primary("CLAUDE.md")}`);
    createdFiles.push("CLAUDE.md");
  } catch (err) {
    claudeMdSpinner.fail(`Failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  // 2. Generate .claude/settings.json
  const settingsSpinner = new Spinner(`Generating ${theme.primary(".claude/settings.json")}...`);
  settingsSpinner.start();
  try {
    const settingsConfig: SettingsConfig = {
      projectName: opts.project,
      techStack,
      language,
      features,
    };
    const settings = await generateSettingsWithAI(settingsConfig);
    await fse.writeFile(path.join(claudeDir, "settings.json"), settings);
    settingsSpinner.succeed(`Created ${theme.primary(".claude/settings.json")}`);
    createdFiles.push(".claude/settings.json");
  } catch (err) {
    settingsSpinner.fail(`Failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  // 3. Generate .claude/rules/
  const rulesSpinner = new Spinner(`Generating ${theme.primary(".claude/rules/")}...`);
  rulesSpinner.start();
  try {
    const rulesConfig: RulesConfig = {
      projectName: opts.project,
      techStack,
      language,
      features,
    };
    const rules = await generateRulesWithAI(rulesConfig);
    for (const rule of rules) {
      await fse.writeFile(path.join(claudeDir, "rules", rule.filename), rule.content);
      createdFiles.push(`.claude/rules/${rule.filename}`);
    }
    rulesSpinner.succeed(`Created ${theme.primary(`.claude/rules/`)} ${theme.dim(`(${rules.length} rules)`)}`);
  } catch (err) {
    rulesSpinner.fail(`Failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  // 4. Generate skills
  for (const skillName of skillNames) {
    const skillSpinner = new Spinner(`Generating skill ${theme.primary(skillName)}...`);
    skillSpinner.start();
    try {
      const skillConfig: SkillConfig = {
        name: skillName,
        description: `${opts.description} - ${skillName} functionality. Use when working on ${skillName} related tasks.`,
        type: "hybrid",
        freedomLevel: "medium",
        includeReference: true,
        includeExamples: true,
        includeScripts: false,
      };

      const skillDir = path.join(claudeDir, "skills", skillName);
      await fse.ensureDir(skillDir);

      // SKILL.md
      const skillMd = useAI
        ? await generateSkillMdWithAI(skillConfig)
        : generateSkillMd(skillConfig);
      await fse.writeFile(path.join(skillDir, "SKILL.md"), skillMd);
      createdFiles.push(`.claude/skills/${skillName}/SKILL.md`);

      // reference.md
      const refMd = useAI
        ? await generateReferenceMdWithAI(skillConfig)
        : "";
      if (refMd) {
        await fse.writeFile(path.join(skillDir, "reference.md"), refMd);
        createdFiles.push(`.claude/skills/${skillName}/reference.md`);
      }

      // examples.md
      const exMd = useAI
        ? await generateExamplesMdWithAI(skillConfig)
        : "";
      if (exMd) {
        await fse.writeFile(path.join(skillDir, "examples.md"), exMd);
        createdFiles.push(`.claude/skills/${skillName}/examples.md`);
      }

      skillSpinner.succeed(`Created skill ${theme.primary(skillName)}`);
    } catch (err) {
      skillSpinner.fail(`Failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // 5. Generate .gitignore additions
  const gitignoreContent = `# Claude Code local files
CLAUDE.local.md
.claude/settings.local.json
.claude/CLAUDE.local.md
.claude/agent-memory-local/
`;
  const gitignorePath = path.join(projectPath, ".gitignore");
  if (await fse.pathExists(gitignorePath)) {
    const existing = await fse.readFile(gitignorePath, "utf-8");
    if (!existing.includes("CLAUDE.local.md")) {
      await fse.appendFile(gitignorePath, "\n" + gitignoreContent);
      console.log(`${symbols.tick} Updated ${theme.dim(".gitignore")}`);
    }
  } else {
    await fse.writeFile(gitignorePath, gitignoreContent);
    createdFiles.push(".gitignore");
    console.log(`${symbols.tick} Created ${theme.dim(".gitignore")}`);
  }

  // Summary
  console.log("");
  console.log(divider(56));
  console.log("");
  console.log(`${symbols.tick} ${theme.success(`Project "${opts.project}" setup complete!`)}`);
  console.log(`  ${theme.dim(`${createdFiles.length} files created`)}`);
  console.log("");
  console.log(`  ${theme.dim("Location:")} ${theme.primary(`projekte/${opts.project}/`)}`);
  console.log("");

  // Tree view
  console.log(`  ${theme.dim("projekte/")}`);
  console.log(`  ${theme.dim("└──")} ${theme.primary(opts.project + "/")}`);
  console.log(`      ${theme.dim("├──")} ${theme.bold("CLAUDE.md")}`);
  console.log(`      ${theme.dim("├──")} .gitignore`);
  console.log(`      ${theme.dim("└──")} ${theme.primary(".claude/")}`);
  console.log(`          ${theme.dim("├──")} settings.json`);
  console.log(`          ${theme.dim("├──")} ${theme.primary("rules/")}`);
  const ruleFiles = createdFiles.filter((f) => f.startsWith(".claude/rules/"));
  ruleFiles.forEach((f, i) => {
    const isLast = i === ruleFiles.length - 1 && skillNames.length === 0;
    console.log(`          ${theme.dim("│   ")}${theme.dim(isLast ? "└──" : "├──")} ${path.basename(f)}`);
  });
  if (skillNames.length > 0) {
    console.log(`          ${theme.dim("└──")} ${theme.primary("skills/")}`);
    skillNames.forEach((skill, i) => {
      const isLast = i === skillNames.length - 1;
      console.log(`              ${theme.dim(isLast ? "└──" : "├──")} ${theme.bold(skill + "/")}`);
      const skillFiles = createdFiles.filter((f) => f.includes(`skills/${skill}/`));
      skillFiles.forEach((f, j) => {
        const prefix = isLast ? "    " : "│   ";
        const isLastFile = j === skillFiles.length - 1;
        console.log(`              ${theme.dim(prefix)}${theme.dim(isLastFile ? "└──" : "├──")} ${path.basename(f)}`);
      });
    });
  }
  console.log("");
}

function detectLanguage(techStack: string[]): string {
  const stackStr = techStack.join(" ").toLowerCase();
  if (/typescript|ts|angular|nest/.test(stackStr)) return "TypeScript";
  if (/python|django|flask|fastapi/.test(stackStr)) return "Python";
  if (/rust/.test(stackStr)) return "Rust";
  if (/go|golang/.test(stackStr)) return "Go";
  if (/java|spring|kotlin/.test(stackStr)) return "Java";
  if (/ruby|rails/.test(stackStr)) return "Ruby";
  if (/php|laravel/.test(stackStr)) return "PHP";
  return "JavaScript";
}
