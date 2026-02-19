// Validate command - validates an existing skill directory
import React from "react";
import { render } from "ink";
import { Box, Text } from "ink";
import { Header } from "../components/Header.js";
import { ValidationReport } from "../components/ValidationReport.js";
import { validateSkillDirectory } from "../validation/validator.js";
import { theme, symbols } from "../utils/styles.js";
import * as path from "path";

function ValidateView({ result, skillPath }: {
  result: Awaited<ReturnType<typeof validateSkillDirectory>>;
  skillPath: string;
}) {
  return (
    <Box flexDirection="column">
      <Header />
      <Text bold>{theme.primary("Validating Skill")}</Text>
      <Text>{theme.dim(`Path: ${skillPath}`)}</Text>
      <ValidationReport result={result} />
    </Box>
  );
}

export async function validateCommand(skillPath: string): Promise<void> {
  const resolvedPath = path.resolve(skillPath);

  console.log(""); // spacing

  const { Spinner } = await import("../utils/animations.js");
  const spinner = new Spinner("Validating skill...");
  spinner.start();

  const result = await validateSkillDirectory(resolvedPath);

  spinner.stop();

  const { waitUntilExit } = render(
    <ValidateView result={result} skillPath={resolvedPath} />
  );
  await waitUntilExit();

  if (!result.valid) {
    process.exitCode = 1;
  }
}
