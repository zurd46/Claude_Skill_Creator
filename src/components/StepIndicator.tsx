// Step progress indicator component
import React from "react";
import { Box, Text } from "ink";
import { symbols, theme } from "../utils/styles.js";

interface Step {
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box flexDirection="row" gap={1}>
        {steps.map((step, i) => {
          const isCompleted = i < currentStep;
          const isCurrent = i === currentStep;

          let icon: string;
          let color: (s: string) => string;

          if (isCompleted) {
            icon = symbols.stepDone;
            color = theme.success;
          } else if (isCurrent) {
            icon = symbols.stepCurrent;
            color = theme.primary;
          } else {
            icon = symbols.bullet;
            color = theme.dim;
          }

          return (
            <Box key={i} flexDirection="row" gap={0}>
              <Text>{icon} </Text>
              <Text>{color(step.label)}</Text>
              {i < steps.length - 1 && (
                <Text> {theme.dim("─")} </Text>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
