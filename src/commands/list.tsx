// List command - lists all skills in a project
import React from "react";
import { render } from "ink";
import { Box, Text } from "ink";
import { Header } from "../components/Header.js";
import { theme, symbols } from "../utils/styles.js";
import { listProjects, listSkills, getSkillPath } from "../utils/fs.js";
import fse from "fs-extra";
import * as nodeFs from "node:fs/promises";
import * as path from "path";

interface SkillInfo {
  name: string;
  description: string;
  files: string[];
}

function ListView({
  projectName,
  skills,
}: {
  projectName?: string;
  skills: { project: string; skills: SkillInfo[] }[];
}) {
  return (
    <Box flexDirection="column">
      <Header />

      {skills.length === 0 && (
        <Text>{symbols.info} {theme.dim("No skills found. Use")} {theme.primary("skill-creator create")} {theme.dim("to create one.")}</Text>
      )}

      {skills.map((group) => (
        <Box key={group.project} flexDirection="column" marginBottom={1}>
          <Text bold>{theme.primary(`Project: ${group.project}`)}</Text>
          {group.skills.length === 0 ? (
            <Text>  {theme.dim("No skills")}</Text>
          ) : (
            group.skills.map((skill) => (
              <Box key={skill.name} flexDirection="column" marginLeft={2}>
                <Text>
                  {symbols.bullet} {theme.bold(skill.name)}
                  {theme.dim(` (${skill.files.length} file${skill.files.length > 1 ? "s" : ""})`)}
                </Text>
                <Text>  {theme.dim(skill.description || "No description")}</Text>
              </Box>
            ))
          )}
        </Box>
      ))}
    </Box>
  );
}

export async function listCommand(projectName?: string): Promise<void> {
  const projects = projectName ? [projectName] : await listProjects();

  const result: { project: string; skills: SkillInfo[] }[] = [];

  for (const project of projects) {
    const skillNames = await listSkills(project);
    const skills: SkillInfo[] = [];

    for (const name of skillNames) {
      const skillPath = getSkillPath(project, name);
      const skillMdPath = path.join(skillPath, "SKILL.md");
      let description = "";

      if (await fse.pathExists(skillMdPath)) {
        const content = await fse.readFile(skillMdPath, "utf-8");
        const descMatch = content.match(/description:\s*(.+)/);
        if (descMatch) {
          description = descMatch[1].trim().replace(/^["']|["']$/g, "");
        }
      }

      const entries = await nodeFs.readdir(skillPath);
      skills.push({ name, description, files: entries });
    }

    result.push({ project, skills });
  }

  const { waitUntilExit } = render(
    <ListView projectName={projectName} skills={result} />
  );
  await waitUntilExit();
}
