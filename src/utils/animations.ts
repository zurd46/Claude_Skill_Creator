// Terminal animation utilities
import pc from "picocolors";

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const PROGRESS_CHARS = ["░", "▒", "▓", "█"];

export class Spinner {
  private frames = SPINNER_FRAMES;
  private interval: ReturnType<typeof setInterval> | null = null;
  private frameIndex = 0;
  private text: string;

  constructor(text: string) {
    this.text = text;
  }

  start(): void {
    process.stdout.write("\x1B[?25l"); // Hide cursor
    this.interval = setInterval(() => {
      const frame = pc.cyan(this.frames[this.frameIndex % this.frames.length]);
      process.stdout.write(`\r${frame} ${this.text}`);
      this.frameIndex++;
    }, 80);
  }

  update(text: string): void {
    this.text = text;
  }

  succeed(text?: string): void {
    this.stop();
    console.log(`\r${pc.green("✔")} ${text ?? this.text}`);
  }

  fail(text?: string): void {
    this.stop();
    console.log(`\r${pc.red("✖")} ${text ?? this.text}`);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    process.stdout.write("\r\x1B[K"); // Clear line
    process.stdout.write("\x1B[?25h"); // Show cursor
  }
}

// Typing effect for streaming text
export async function typeText(
  text: string,
  speed: number = 15
): Promise<void> {
  for (const char of text) {
    process.stdout.write(char);
    await sleep(speed);
  }
  process.stdout.write("\n");
}

// Progress bar
export function progressBar(
  current: number,
  total: number,
  width: number = 30
): string {
  const ratio = Math.min(current / total, 1);
  const filled = Math.round(ratio * width);
  const empty = width - filled;
  const bar = pc.cyan("█".repeat(filled)) + pc.dim("░".repeat(empty));
  const pct = Math.round(ratio * 100);
  return `${bar} ${pc.bold(String(pct))}%`;
}

// Animated step counter
export function stepCounter(current: number, total: number): string {
  return pc.dim(`[${pc.cyan(String(current))}/${total}]`);
}

// Sleep utility
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Animated file creation message
export async function animateFileCreation(filePath: string): Promise<void> {
  const spinner = new Spinner(`Creating ${pc.cyan(filePath)}`);
  spinner.start();
  await sleep(300 + Math.random() * 400);
  spinner.succeed(`Created ${pc.cyan(filePath)}`);
}

// Section divider
export function divider(width: number = 50): string {
  return pc.dim("─".repeat(width));
}
