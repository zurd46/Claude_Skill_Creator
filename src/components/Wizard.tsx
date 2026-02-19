// Multi-step wizard for interactive skill creation
import React, { useState, useCallback } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { Header } from "./Header.js";
import { StepIndicator } from "./StepIndicator.js";
import { SkillPreview } from "./SkillPreview.js";
import { ValidationReport } from "./ValidationReport.js";
import { theme, symbols } from "../utils/styles.js";
import { validateSkillConfig } from "../validation/validator.js";
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
import type { SkillConfig } from "../validation/schemas.js";

type WizardStep =
  | "project"
  | "name"
  | "description"
  | "type"
  | "freedom"
  | "extras"
  | "preview"
  | "generating"
  | "done";

const STEPS = [
  { label: "Project" },
  { label: "Name" },
  { label: "Description" },
  { label: "Type" },
  { label: "Freedom" },
  { label: "Extras" },
  { label: "Generate" },
];

const STEP_MAP: Record<WizardStep, number> = {
  project: 0,
  name: 1,
  description: 2,
  type: 3,
  freedom: 4,
  extras: 5,
  preview: 6,
  generating: 6,
  done: 6,
};

const SKILL_TYPES = [
  { label: "Reference", value: "reference" as const, desc: "API docs, guidelines, knowledge base" },
  { label: "Task", value: "task" as const, desc: "Step-by-step workflows, procedures" },
  { label: "Hybrid", value: "hybrid" as const, desc: "Combined reference + task (recommended)" },
];

const FREEDOM_LEVELS = [
  { label: "High", value: "high" as const, desc: "Text instructions, Claude decides approach" },
  { label: "Medium", value: "medium" as const, desc: "Structured patterns, recommended approach" },
  { label: "Low", value: "low" as const, desc: "Exact scripts, step-by-step procedures" },
];

const EXTRAS = [
  { label: "reference.md", key: "includeReference" as const, desc: "Detailed API/config reference" },
  { label: "examples.md", key: "includeExamples" as const, desc: "Usage examples & patterns" },
];

// Simple text input component
function TextInput({
  value,
  onChange,
  onSubmit,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}) {
  useInput((input, key) => {
    if (key.return) {
      onSubmit();
    } else if (key.backspace || key.delete) {
      onChange(value.slice(0, -1));
    } else if (!key.ctrl && !key.meta && input) {
      onChange(value + input);
    }
  });

  return (
    <Box>
      <Text>
        {theme.primary("> ")}
        {value || theme.dim(placeholder ?? "")}
        {theme.primary("█")}
      </Text>
    </Box>
  );
}

// Select component
function SelectInput<T extends string>({
  items,
  onSelect,
}: {
  items: { label: string; value: T; desc: string }[];
  onSelect: (value: T) => void;
}) {
  const [selected, setSelected] = useState(0);

  useInput((_input, key) => {
    if (key.upArrow) {
      setSelected((s) => (s > 0 ? s - 1 : items.length - 1));
    } else if (key.downArrow) {
      setSelected((s) => (s < items.length - 1 ? s + 1 : 0));
    } else if (key.return) {
      onSelect(items[selected]!.value);
    }
  });

  return (
    <Box flexDirection="column">
      {items.map((item, i) => (
        <Box key={i} gap={1}>
          <Text>
            {i === selected ? theme.primary("❯") : " "}
            {" "}
            {i === selected ? theme.bold(item.label) : item.label}
          </Text>
          <Text>{theme.dim(item.desc)}</Text>
        </Box>
      ))}
      <Text>{"\n"}{theme.dim("↑/↓ to navigate, Enter to select")}</Text>
    </Box>
  );
}

// Multi-select component
function MultiSelect({
  items,
  onSubmit,
}: {
  items: { label: string; key: string; desc: string }[];
  onSubmit: (selected: string[]) => void;
}) {
  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useInput((_input, key) => {
    if (key.upArrow) {
      setCursor((c) => (c > 0 ? c - 1 : items.length - 1));
    } else if (key.downArrow) {
      setCursor((c) => (c < items.length - 1 ? c + 1 : 0));
    } else if (_input === " ") {
      setSelected((prev) => {
        const next = new Set(prev);
        const k = items[cursor]!.key;
        if (next.has(k)) next.delete(k);
        else next.add(k);
        return next;
      });
    } else if (key.return) {
      onSubmit(Array.from(selected));
    }
  });

  return (
    <Box flexDirection="column">
      {items.map((item, i) => {
        const isSelected = selected.has(item.key);
        return (
          <Box key={i} gap={1}>
            <Text>
              {i === cursor ? theme.primary("❯") : " "}
              {" "}
              {isSelected ? theme.success("◉") : theme.dim("○")}
              {" "}
              {i === cursor ? theme.bold(item.label) : item.label}
            </Text>
            <Text>{theme.dim(item.desc)}</Text>
          </Box>
        );
      })}
      <Text>{"\n"}{theme.dim("↑/↓ navigate, Space toggle, Enter confirm")}</Text>
    </Box>
  );
}

export function Wizard() {
  const { exit } = useApp();
  const [step, setStep] = useState<WizardStep>("project");
  const [error, setError] = useState<string>("");
  const [projectName, setProjectName] = useState("");
  const [config, setConfig] = useState<Partial<SkillConfig>>({
    type: "hybrid",
    freedomLevel: "medium",
    includeReference: false,
    includeExamples: false,
    includeScripts: false,
  });
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([]);

  const handleProjectSubmit = useCallback(() => {
    const name = projectName.trim();
    if (!name) {
      setError("Project name is required");
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      setError("Only letters, numbers, hyphens and underscores allowed");
      return;
    }
    setError("");
    setStep("name");
  }, [projectName]);

  const [skillName, setSkillName] = useState("");

  const handleNameSubmit = useCallback(() => {
    const name = skillName.trim();
    if (!name) {
      setError("Skill name is required");
      return;
    }
    const validation = validateSkillConfig({ name, description: "temp" });
    const nameErrors = validation.errors.filter((e) => e.field === "name");
    if (nameErrors.length > 0) {
      setError(nameErrors[0]!.message);
      return;
    }
    setError("");
    setConfig((c) => ({ ...c, name }));
    setStep("description");
  }, [skillName]);

  const [description, setDescription] = useState("");

  const handleDescriptionSubmit = useCallback(() => {
    const desc = description.trim();
    if (!desc) {
      setError("Description is required");
      return;
    }
    const validation = validateSkillConfig({
      name: config.name ?? "test",
      description: desc,
    });
    const descErrors = validation.errors.filter(
      (e) => e.field === "description"
    );
    if (descErrors.length > 0) {
      setError(descErrors[0]!.message);
      return;
    }
    setError("");
    setConfig((c) => ({ ...c, description: desc }));
    setStep("type");
  }, [description, config.name]);

  const handleTypeSelect = useCallback(
    (type: "reference" | "task" | "hybrid") => {
      setConfig((c) => ({ ...c, type }));
      setStep("freedom");
    },
    []
  );

  const handleFreedomSelect = useCallback(
    (freedomLevel: "high" | "medium" | "low") => {
      setConfig((c) => ({ ...c, freedomLevel }));
      setStep("extras");
    },
    []
  );

  const handleExtrasSubmit = useCallback(
    (selected: string[]) => {
      setConfig((c) => ({
        ...c,
        includeReference: selected.includes("includeReference"),
        includeExamples: selected.includes("includeExamples"),
      }));
      setStep("preview");
    },
    []
  );

  // Generate files on preview confirm
  const handleGenerate = useCallback(async () => {
    setStep("generating");

    const fullConfig: SkillConfig = {
      name: config.name!,
      description: config.description!,
      type: config.type ?? "hybrid",
      freedomLevel: config.freedomLevel ?? "medium",
      includeReference: config.includeReference ?? false,
      includeExamples: config.includeExamples ?? false,
      includeScripts: false,
    };

    try {
      await ensureProjectExists(projectName);

      const exists = await skillExists(projectName, fullConfig.name);
      if (exists) {
        setError(`Skill "${fullConfig.name}" already exists in project "${projectName}"`);
        setStep("preview");
        return;
      }

      const files: string[] = [];
      const useAI = isConfigured();

      // Generate SKILL.md
      const skillMdContent = useAI
        ? await generateSkillMdWithAI(fullConfig)
        : generateSkillMd(fullConfig);
      await writeSkillFile(projectName, fullConfig.name, "SKILL.md", skillMdContent);
      files.push("SKILL.md");

      // Generate reference.md if requested
      if (fullConfig.includeReference) {
        const refContent = useAI
          ? await generateReferenceMdWithAI(fullConfig)
          : generateReferenceMd(fullConfig.name);
        await writeSkillFile(projectName, fullConfig.name, "reference.md", refContent);
        files.push("reference.md");
      }

      // Generate examples.md if requested
      if (fullConfig.includeExamples) {
        const exContent = useAI
          ? await generateExamplesMdWithAI(fullConfig)
          : generateExamplesMd(fullConfig.name);
        await writeSkillFile(projectName, fullConfig.name, "examples.md", exContent);
        files.push("examples.md");
      }

      setGeneratedFiles(files);
      setStep("done");
    } catch (err) {
      setError(`Generation failed: ${err instanceof Error ? err.message : String(err)}`);
      setStep("preview");
    }
  }, [config, projectName]);

  // Confirm generation with keypress
  useInput(
    (_input, key) => {
      if (step === "preview" && key.return) {
        handleGenerate();
      }
      if (step === "done" && key.return) {
        exit();
      }
    },
    { isActive: step === "preview" || step === "done" }
  );

  const previewFiles = [
    "SKILL.md",
    ...(config.includeReference ? ["reference.md"] : []),
    ...(config.includeExamples ? ["examples.md"] : []),
  ];

  return (
    <Box flexDirection="column">
      <Header />
      <StepIndicator steps={STEPS} currentStep={STEP_MAP[step] ?? 0} />

      {error && (
        <Box marginBottom={1}>
          <Text>{symbols.cross} {theme.error(error)}</Text>
        </Box>
      )}

      {step === "project" && (
        <Box flexDirection="column">
          <Text bold>{theme.primary("Project Name")}</Text>
          <Text>{theme.dim("Enter the project name (creates projekte/<name>/skills/)")}</Text>
          <TextInput
            value={projectName}
            onChange={setProjectName}
            onSubmit={handleProjectSubmit}
            placeholder="my-project"
          />
        </Box>
      )}

      {step === "name" && (
        <Box flexDirection="column">
          <Text bold>{theme.primary("Skill Name")}</Text>
          <Text>{theme.dim("Lowercase letters, numbers, hyphens only (max 64 chars)")}</Text>
          <Text>{theme.dim('Prefer gerund form: "processing-pdfs", "analyzing-data"')}</Text>
          <TextInput
            value={skillName}
            onChange={setSkillName}
            onSubmit={handleNameSubmit}
            placeholder="processing-pdfs"
          />
        </Box>
      )}

      {step === "description" && (
        <Box flexDirection="column">
          <Text bold>{theme.primary("Description")}</Text>
          <Text>{theme.dim("Third person, describes what it does AND when to use it (max 1024 chars)")}</Text>
          <Text>{theme.dim('Example: "Processes PDF files and extracts structured data. Use when working with PDF imports."')}</Text>
          <TextInput
            value={description}
            onChange={setDescription}
            onSubmit={handleDescriptionSubmit}
            placeholder="Generates reports from data. Use when..."
          />
        </Box>
      )}

      {step === "type" && (
        <Box flexDirection="column">
          <Text bold>{theme.primary("Skill Type")}</Text>
          <Text>{theme.dim("What kind of skill is this?")}</Text>
          <SelectInput items={SKILL_TYPES} onSelect={handleTypeSelect} />
        </Box>
      )}

      {step === "freedom" && (
        <Box flexDirection="column">
          <Text bold>{theme.primary("Freedom Level")}</Text>
          <Text>{theme.dim("How much freedom should Claude have?")}</Text>
          <SelectInput items={FREEDOM_LEVELS} onSelect={handleFreedomSelect} />
        </Box>
      )}

      {step === "extras" && (
        <Box flexDirection="column">
          <Text bold>{theme.primary("Supporting Files")}</Text>
          <Text>{theme.dim("Select additional files to generate (optional)")}</Text>
          <MultiSelect items={EXTRAS} onSubmit={handleExtrasSubmit} />
        </Box>
      )}

      {step === "preview" && (
        <Box flexDirection="column">
          <SkillPreview
            projectName={projectName}
            skillName={config.name ?? ""}
            files={previewFiles}
          />
          <Box marginTop={1} flexDirection="column">
            <Text>  {theme.dim("Name:")}        {config.name}</Text>
            <Text>  {theme.dim("Description:")} {config.description}</Text>
            <Text>  {theme.dim("Type:")}        {config.type}</Text>
            <Text>  {theme.dim("Freedom:")}     {config.freedomLevel}</Text>
            <Text>  {theme.dim("AI:")}          {isConfigured() ? theme.success("OpenRouter (Sonnet 4.6)") : theme.warning("Static templates")}</Text>
          </Box>
          <Box marginTop={1}>
            <Text>{theme.primary("Press Enter to generate")} {theme.dim("or Ctrl+C to cancel")}</Text>
          </Box>
        </Box>
      )}

      {step === "generating" && (
        <Box flexDirection="column">
          <Text>{theme.primary("⠋")} {isConfigured() ? "Generating skill with AI..." : "Generating skill files..."}</Text>
          {isConfigured() && (
            <Text>  {theme.dim("This may take a moment...")}</Text>
          )}
        </Box>
      )}

      {step === "done" && (
        <Box flexDirection="column" marginTop={1}>
          <Text>{symbols.tick} {theme.success("Skill created successfully!")}</Text>
          <Text />
          {generatedFiles.map((file, i) => (
            <Text key={i}>  {symbols.tick} {theme.dim(`projekte/${projectName}/skills/${config.name}/${file}`)}</Text>
          ))}
          <Text />
          <Text>{theme.dim("Press Enter to exit")}</Text>
        </Box>
      )}
    </Box>
  );
}
