// Init command - initialize a new project
import { ensureProjectExists, getProjectPath } from "../utils/fs.js";
import { Spinner } from "../utils/animations.js";
import { theme, symbols } from "../utils/styles.js";
import { renderHeader } from "../utils/styles.js";

export async function initCommand(projectName: string): Promise<void> {
  console.log(renderHeader());
  console.log("");

  if (!projectName || projectName.trim().length === 0) {
    console.log(`${symbols.cross} ${theme.error("Project name is required")}`);
    console.log(`  ${theme.dim("Usage: skill-creator init <project-name>")}`);
    process.exitCode = 1;
    return;
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(projectName)) {
    console.log(`${symbols.cross} ${theme.error("Invalid project name")}`);
    console.log(`  ${theme.dim("Only letters, numbers, hyphens and underscores allowed")}`);
    process.exitCode = 1;
    return;
  }

  const spinner = new Spinner(`Creating project "${projectName}"`);
  spinner.start();

  try {
    await ensureProjectExists(projectName);
    const projectPath = getProjectPath(projectName);

    spinner.succeed(`Project "${projectName}" created`);
    console.log("");
    console.log(`  ${symbols.arrow} ${theme.dim(projectPath)}`);
    console.log("");
    console.log(
      `  ${theme.dim("Next:")} ${theme.primary("skill-creator create")} ${theme.dim("to add a skill")}`
    );
  } catch (err) {
    spinner.fail(`Failed to create project: ${err instanceof Error ? err.message : String(err)}`);
    process.exitCode = 1;
  }
}
