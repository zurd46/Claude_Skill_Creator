// ASCII art header component
import React from "react";
import { Box, Text } from "ink";
import { renderHeader, theme, divider } from "../utils/styles.js";

export function Header() {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text>{renderHeader()}</Text>
      <Text>{divider(56)}</Text>
      <Text>
        {"  "}
        {theme.dim("Generate perfect Claude Agent Skills")}
      </Text>
      <Text>
        {"  "}
        {theme.dim("100% compliant with Anthropic documentation")}
      </Text>
      <Text>{divider(56)}</Text>
    </Box>
  );
}
