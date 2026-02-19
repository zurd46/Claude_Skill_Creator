// Preview generated skill files
import React from "react";
import { Box, Text } from "ink";
import { symbols, theme } from "../utils/styles.js";

interface SkillPreviewProps {
  projectName: string;
  skillName: string;
  files: string[];
}

export function SkillPreview({ projectName, skillName, files }: SkillPreviewProps) {
  return (
    <Box flexDirection="column" marginY={1}>
      <Text bold>{theme.primary("Skill Preview")}</Text>
      <Text>{theme.dim("The following files will be created:")}</Text>
      <Text />
      <Box flexDirection="column" marginLeft={2}>
        <Text>{theme.dim("projekte/")}</Text>
        <Text>{"  "}{theme.dim(`└── ${projectName}/`)}</Text>
        <Text>{"    "}{theme.dim("└── skills/")}</Text>
        <Text>{"      "}{theme.primary(`└── ${skillName}/`)}</Text>
        {files.map((file, i) => {
          const isLast = i === files.length - 1;
          const prefix = isLast ? "└── " : "├── ";
          const isRequired = file === "SKILL.md";
          return (
            <Text key={i}>
              {"        "}
              {theme.dim(prefix)}
              {isRequired ? theme.bold(theme.primary(file)) : theme.dim(file)}
              {isRequired ? ` ${symbols.tick}` : ""}
            </Text>
          );
        })}
      </Box>
    </Box>
  );
}
