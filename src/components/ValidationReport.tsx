// Validation report display component
import React from "react";
import { Box, Text } from "ink";
import { symbols, theme } from "../utils/styles.js";
import type { ValidationResult } from "../validation/rules.js";

interface ValidationReportProps {
  result: ValidationResult;
  title?: string;
}

export function ValidationReport({ result, title }: ValidationReportProps) {
  return (
    <Box flexDirection="column" marginY={1}>
      {title && (
        <Text bold>{theme.primary(title)}</Text>
      )}

      {result.valid && result.warnings.length === 0 && (
        <Text>{symbols.tick} {theme.success("All checks passed!")}</Text>
      )}

      {result.valid && result.warnings.length > 0 && (
        <Text>{symbols.tick} {theme.success("Valid")} {theme.dim(`(${result.warnings.length} warning${result.warnings.length > 1 ? "s" : ""})`)}</Text>
      )}

      {!result.valid && (
        <Text>{symbols.cross} {theme.error(`${result.errors.length} error${result.errors.length > 1 ? "s" : ""} found`)}</Text>
      )}

      {result.errors.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          <Text bold>{theme.error("Errors:")}</Text>
          {result.errors.map((err, i) => (
            <Box key={i} flexDirection="column" marginLeft={2}>
              <Text>
                {symbols.cross} {theme.bold(err.field)}: {err.message}
                {err.line ? theme.dim(` (line ${err.line})`) : ""}
              </Text>
              {err.suggestion && (
                <Text>
                  {"  "}{symbols.arrow} {theme.dim(err.suggestion)}
                </Text>
              )}
            </Box>
          ))}
        </Box>
      )}

      {result.warnings.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          <Text bold>{theme.warning("Warnings:")}</Text>
          {result.warnings.map((warn, i) => (
            <Box key={i} flexDirection="column" marginLeft={2}>
              <Text>
                {symbols.warning} {theme.bold(warn.field)}: {warn.message}
              </Text>
              {warn.suggestion && (
                <Text>
                  {"  "}{symbols.arrow} {theme.dim(warn.suggestion)}
                </Text>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
