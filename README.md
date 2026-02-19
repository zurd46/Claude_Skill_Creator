# ClaudeCodeSkillCreator

Generate complete Claude Code project setups — 100% compliant with [Anthropic documentation](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview).

```
  ___ _   _ _ _    ___              _
 / __| |_(_) | |  / __|_ _ ___ __ _| |_ ___ _ _
 \__ \ / / | | | | (__| '_/ -_) _` |  _/ _ \ '_|
 |___/_\_\_|_|_|  \___|_| \___\__,_|\__\___/_|
```

## Features

- **Complete Project Setup** — generates `CLAUDE.md`, `.claude/settings.json`, `.claude/rules/`, and `.claude/skills/` in one command
- **AI-Powered Content** — uses OpenRouter API (Sonnet 4.6) to generate real, context-aware content for your tech stack
- **Smart Rule Detection** — auto-detects relevant rule topics from your tech stack (React → components, Express → API design, Postgres → database, etc.)
- **Full Validation** — enforces all Anthropic skill rules (name, description, body, paths, references)
- **9 Template Variants** — 3 types (reference / task / hybrid) x 3 freedom levels (high / medium / low)
- **Static Fallback** — works without API key using built-in templates
- **Beautiful CLI** — ASCII art header, gradient colors, spinners, progress indicators

## Installation

```bash
npm install
```

### OpenRouter API (optional, recommended)

Create a `.env` file for AI-powered content generation:

```bash
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_MODEL=anthropic/claude-sonnet-4.6
```

Without an API key, the tool falls back to static templates.

## Usage

```bash
# Show help
npx tsx src/index.tsx

# Create a complete project setup
npx tsx src/index.tsx new my-app "E-commerce platform" -s react,typescript,express,postgres

# Create with features and skills
npx tsx src/index.tsx new my-app "E-commerce platform" \
  -s react,typescript,express,postgres \
  -f "auth,payments,search" \
  --skills "code-review,deploying-apps"

# Add a skill to an existing project
npx tsx src/index.tsx add my-app code-review "Reviews code for best practices"

# Validate a skill directory
npx tsx src/index.tsx validate projekte/my-app/.claude/skills/code-review

# List all projects and skills
npx tsx src/index.tsx list
```

## Commands

| Command | Alias | Description |
|---------|-------|-------------|
| `ccsk new <project> <description> -s <stack>` | — | Create complete project setup |
| `ccsk add <project> <skill> <description>` | — | Add a skill to an existing project |
| `ccsk validate <path>` | `check` | Validate a skill directory |
| `ccsk list [project]` | `ls` | List all projects and skills |

### `new` Options

| Flag | Description | Default |
|------|-------------|---------|
| `-s, --stack <items>` | Tech stack, comma-separated (required) | — |
| `-f, --features <items>` | Key features, comma-separated | — |
| `--skills <items>` | Skills to generate, comma-separated | — |
| `--no-ai` | Use static templates instead of AI | — |

### `add` Options

| Flag | Description | Default |
|------|-------------|---------|
| `-t, --type <type>` | `reference` \| `task` \| `hybrid` | `hybrid` |
| `-f, --freedom <level>` | `high` \| `medium` \| `low` | `medium` |
| `-r, --reference` | Include `reference.md` | `true` |
| `-e, --examples` | Include `examples.md` | `true` |
| `--no-ai` | Use static templates instead of AI | — |

## What Gets Generated

### `ccsk new` — Full Project Setup

```
projekte/
└── <project-name>/
    ├── CLAUDE.md                    # Project-level instructions
    ├── .gitignore                   # Claude Code local files excluded
    └── .claude/
        ├── settings.json            # Permissions, hooks, env config
        ├── rules/                   # Topic-specific rule files
        │   ├── code-style.md
        │   ├── testing.md
        │   ├── components.md        # (if React/Vue/Svelte detected)
        │   ├── api-design.md        # (if Express/FastAPI detected)
        │   ├── database.md          # (if DB stack detected)
        │   ├── typescript.md        # (if TypeScript detected)
        │   ├── security.md          # (if auth features detected)
        │   └── deployment.md        # (if deploy features detected)
        └── skills/
            └── <skill-name>/
                ├── SKILL.md         # Main skill instructions
                ├── reference.md     # API/config reference
                └── examples.md      # Usage examples
```

### `ccsk add` — Single Skill

```
projekte/<project-name>/.claude/skills/<skill-name>/
├── SKILL.md
├── reference.md
└── examples.md
```

## Generated File Details

| File | Purpose |
|------|---------|
| **CLAUDE.md** | Project overview, tech stack, dev commands, conventions, architecture |
| **settings.json** | Permission rules (allow/deny), PostToolUse hooks for linting/formatting |
| **rules/*.md** | Topic-specific rules with optional path filters in YAML frontmatter |
| **skills/*/SKILL.md** | Skill instructions with frontmatter (name, description, type) |
| **skills/*/reference.md** | API docs, configs, knowledge base for the skill |
| **skills/*/examples.md** | Usage patterns, common scenarios, edge cases |

## Smart Rule Detection

The tool auto-detects relevant rule topics based on your tech stack:

| Tech Stack | Detected Rules |
|-----------|----------------|
| React, Vue, Svelte, Angular | `components.md` |
| Express, FastAPI, Django, NestJS | `api-design.md` |
| Postgres, MySQL, Mongo, Prisma | `database.md` |
| TypeScript | `typescript.md` |
| Auth/JWT/OAuth features | `security.md` |
| Docker/CI/CD features | `deployment.md` |
| *(always included)* | `code-style.md`, `testing.md` |

## Validation Rules

All generated skills are validated against the official Anthropic specification:

| Rule | Constraint |
|------|-----------|
| **Name** | Max 64 chars, lowercase letters/numbers/hyphens only |
| **Reserved words** | No "anthropic", "claude", "system", "admin", "root" |
| **Description** | Max 1024 chars, third person, no XML tags |
| **SKILL.md body** | Max 500 lines |
| **File references** | One level deep only (no nested paths) |
| **Paths** | Forward slashes only (no Windows `\` paths) |

## Tech Stack

- **TypeScript** + **tsx**
- **Ink** (React for CLI) + **Commander** (argument parsing)
- **Zod** (validation schemas)
- **OpenRouter API** (AI content generation via Sonnet 4.6)
- **Figlet** + **gradient-string** (ASCII art)
- **Picocolors** (terminal styling)
- **fs-extra** (file operations)
- **dotenv** (environment config)

## Project Structure

```
src/
├── index.tsx                    # CLI entry point (4 commands)
├── commands/
│   ├── setup.ts                 # `new` — full project generation
│   ├── quick-create.ts          # `add` — single skill creation
│   ├── validate.tsx             # `validate` — skill validation
│   └── list.tsx                 # `list` — project/skill listing
├── components/
│   ├── Header.tsx               # ASCII art gradient header
│   ├── Wizard.tsx               # Multi-step creation wizard
│   ├── StepIndicator.tsx        # Progress steps display
│   ├── ValidationReport.tsx     # Error/warning display
│   └── SkillPreview.tsx         # File tree preview
├── generators/
│   ├── ai-generator.ts          # AI-powered SKILL.md, reference, examples
│   ├── claude-md.ts             # CLAUDE.md generator
│   ├── settings-json.ts         # settings.json generator
│   ├── rules.ts                 # .claude/rules/ generator
│   ├── templates.ts             # 9 template variants
│   ├── skill-md.ts              # Static SKILL.md generator
│   ├── reference-md.ts          # Static reference.md generator
│   └── examples-md.ts           # Static examples.md generator
├── validation/
│   ├── rules.ts                 # All Anthropic validation rules
│   ├── schemas.ts               # Zod schemas
│   └── validator.ts             # Validation engine
└── utils/
    ├── openrouter.ts            # OpenRouter API client
    ├── styles.ts                # Colors, gradients, symbols
    ├── animations.ts            # Spinners, typing effects
    └── fs.ts                    # File system helpers
```

## License

MIT
