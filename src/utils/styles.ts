// Terminal styling utilities
import pc from "picocolors";
import gradient from "gradient-string";
import figlet from "figlet";

// Color theme
export const theme = {
  primary: pc.cyan,
  success: pc.green,
  error: pc.red,
  warning: pc.yellow,
  dim: pc.dim,
  bold: pc.bold,
  accent: pc.magenta,
  info: pc.blue,
};

// Gradient presets
export const gradients = {
  header: gradient(["#6366f1", "#8b5cf6", "#a855f7"]),
  success: gradient(["#22c55e", "#10b981"]),
  accent: gradient(["#06b6d4", "#8b5cf6"]),
};

// ASCII art header
export function renderHeader(): string {
  const art = figlet.textSync("Skill Creator", {
    font: "Small",
    horizontalLayout: "default",
  });
  return gradients.header(art);
}

// Box drawing
export function box(content: string, title?: string): string {
  const lines = content.split("\n");
  const maxLen = Math.max(...lines.map((l) => l.length), (title?.length ?? 0) + 4);
  const top = title
    ? `╭─ ${theme.bold(title)} ${"─".repeat(Math.max(0, maxLen - title.length - 3))}╮`
    : `╭${"─".repeat(maxLen + 2)}╮`;
  const bottom = `╰${"─".repeat(maxLen + 2)}╯`;
  const body = lines
    .map((l) => `│ ${l}${" ".repeat(Math.max(0, maxLen - l.length))} │`)
    .join("\n");
  return `${top}\n${body}\n${bottom}`;
}

// Symbols
export const symbols = {
  tick: pc.green("✔"),
  cross: pc.red("✖"),
  warning: pc.yellow("⚠"),
  info: pc.blue("ℹ"),
  arrow: pc.cyan("→"),
  bullet: pc.dim("●"),
  step: pc.cyan("◆"),
  stepDone: pc.green("◆"),
  stepCurrent: pc.cyan("◇"),
  line: pc.dim("│"),
};

// Formatting helpers
export function heading(text: string): string {
  return `\n${theme.bold(gradients.accent(text))}\n`;
}

export function success(text: string): string {
  return `${symbols.tick} ${theme.success(text)}`;
}

export function error(text: string): string {
  return `${symbols.cross} ${theme.error(text)}`;
}

export function warn(text: string): string {
  return `${symbols.warning} ${theme.warning(text)}`;
}

export function info(text: string): string {
  return `${symbols.info} ${theme.info(text)}`;
}

export function dim(text: string): string {
  return theme.dim(text);
}

export function label(key: string, value: string): string {
  return `  ${theme.dim(key + ":")} ${value}`;
}

// Section divider
export function divider(width: number = 50): string {
  return pc.dim("─".repeat(width));
}
