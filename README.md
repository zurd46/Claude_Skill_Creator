<div align="center">

# ccsk — Claude Code Skill Creator

**Generate complete, production-ready Claude Code project setups in seconds.**

Fully compliant with the [Anthropic Agent Skills specification](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Claude Code](https://img.shields.io/badge/Claude_Code-Compatible-D97706?logo=anthropic&logoColor=white)](https://claude.ai/)

```
  ___ _   _ _ _    ___              _
 / __| |_(_) | |  / __|_ _ ___ __ _| |_ ___ _ _
 \__ \ / / | | | | (__| '_/ -_) _` |  _/ _ \ '_|
 |___/_\_\_|_|_|  \___|_| \___\__,_|\__\___/_|
```

</div>

---

## Why ccsk?

Setting up Claude Code for a new project means creating `CLAUDE.md`, configuring `.claude/settings.json`, writing rule files, and structuring skills — all by hand. **ccsk automates the entire process** and generates context-aware content tailored to your specific tech stack using AI.

> One command. Complete Claude Code setup. Zero boilerplate.

---

## Features

| | Feature | Description |
|---|---------|-------------|
| **1** | **Full Project Scaffold** | Generates `CLAUDE.md`, `settings.json`, `rules/`, and `skills/` in one command |
| **2** | **AI-Powered Content** | Uses OpenRouter (Claude Sonnet 4.6) for real, stack-specific instructions |
| **3** | **Smart Rule Detection** | Auto-detects rule topics from your tech stack |
| **4** | **Anthropic Validation** | Enforces all official skill constraints (name, description, body, paths) |
| **5** | **9 Skill Templates** | 3 types x 3 freedom levels for any use case |
| **6** | **Offline Mode** | Works without API key using built-in static templates |
| **7** | **Beautiful CLI** | Gradient ASCII art, animated spinners, color-coded output |

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-username/claude-code-skill-creator.git
cd claude-code-skill-creator

# 2. Install dependencies
npm install

# 3. (Optional) Configure AI — create .env file
echo 'OPENROUTER_API_KEY=sk-or-v1-your-key-here' > .env
echo 'OPENROUTER_MODEL=anthropic/claude-sonnet-4.6' >> .env

# 4. Generate your first project
npm run dev -- new my-app "E-commerce platform" -s react,typescript,express,postgres
```

---

## Usage

### Create a complete project setup

```bash
ccsk new <project> <description> -s <stack> [options]
```

```bash
# Basic
ccsk new my-app "E-commerce platform" -s react,typescript,express,postgres

# With features and skills
ccsk new my-app "E-commerce platform" \
  -s react,typescript,express,postgres \
  -f "auth,payments,search" \
  --skills "code-review,deploying-apps"

# Without AI (static templates only)
ccsk new my-app "Todo app" -s react,typescript --no-ai
```

### Add a skill to an existing project

```bash
ccsk add <project> <skill> <description> [options]
```

```bash
ccsk add my-app code-review "Reviews code for best practices"
ccsk add my-app deploying-apps "Handles deployment workflows" -t task -f low
```

### Validate & inspect

```bash
# Validate a skill against Anthropic spec
ccsk validate projekte/my-app/.claude/skills/code-review

# List all projects and skills
ccsk list
```

---

## Commands Reference

| Command | Alias | Description |
|---------|-------|-------------|
| `ccsk new <project> <desc> -s <stack>` | — | Create complete project setup |
| `ccsk add <project> <skill> <desc>` | — | Add a skill to an existing project |
| `ccsk validate <path>` | `check` | Validate a skill directory |
| `ccsk list [project]` | `ls` | List all projects and skills |

<details>
<summary><strong><code>new</code> options</strong></summary>

| Flag | Description | Default |
|------|-------------|---------|
| `-s, --stack <items>` | Tech stack, comma-separated **(required)** | — |
| `-f, --features <items>` | Key features, comma-separated | — |
| `--skills <items>` | Skills to generate, comma-separated | — |
| `--no-ai` | Use static templates instead of AI | — |

</details>

<details>
<summary><strong><code>add</code> options</strong></summary>

| Flag | Description | Default |
|------|-------------|---------|
| `-t, --type <type>` | `reference` \| `task` \| `hybrid` | `hybrid` |
| `-f, --freedom <level>` | `high` \| `medium` \| `low` | `medium` |
| `-r, --reference` | Include `reference.md` | `true` |
| `-e, --examples` | Include `examples.md` | `true` |
| `--no-ai` | Use static templates instead of AI | — |

</details>

---

## Generated Output

Running `ccsk new` produces a fully configured Claude Code project:

```
projekte/
└── my-app/
    ├── CLAUDE.md                        # Project instructions for Claude
    ├── .gitignore                       # Excludes local Claude files
    └── .claude/
        ├── settings.json                # Permissions & hooks
        ├── rules/                       # Auto-detected rule files
        │   ├── code-style.md
        │   ├── testing.md
        │   ├── components.md            # if React/Vue/Svelte
        │   ├── api-design.md            # if Express/FastAPI/NestJS
        │   ├── database.md              # if Postgres/Mongo/Prisma
        │   ├── typescript.md            # if TypeScript
        │   ├── security.md              # if auth features
        │   └── deployment.md            # if CI/CD features
        └── skills/
            └── <skill-name>/
                ├── SKILL.md             # Main instructions
                ├── reference.md         # API & config reference
                └── examples.md          # Usage patterns
```

### What each file does

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project overview, dev commands, conventions, architecture decisions |
| `settings.json` | Permission allow/deny rules, PostToolUse hooks for linting |
| `rules/*.md` | Topic-specific rules with optional YAML path filters |
| `SKILL.md` | Skill instructions with frontmatter metadata |
| `reference.md` | API docs, configs, knowledge base for the skill |
| `examples.md` | Common patterns, advanced usage, edge cases |

---

## Smart Rule Detection

Rules are automatically generated based on your tech stack — no manual configuration needed:

| Stack detected | Rule generated |
|---------------|----------------|
| React, Vue, Svelte, Angular | `components.md` |
| Express, FastAPI, Django, NestJS | `api-design.md` |
| Postgres, MySQL, Mongo, Prisma | `database.md` |
| TypeScript | `typescript.md` |
| Auth / JWT / OAuth features | `security.md` |
| Docker / CI/CD features | `deployment.md` |
| *(always)* | `code-style.md`, `testing.md` |

---

## Validation

All generated skills are validated against the [official Anthropic specification](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices):

| Rule | Constraint |
|------|-----------|
| Name | Max 64 chars, lowercase + hyphens only, no reserved words |
| Description | Max 1024 chars, third person, no XML tags |
| SKILL.md body | Max 500 lines |
| File references | One level deep only |
| Paths | Forward slashes only |

---

## AI Configuration

ccsk uses [OpenRouter](https://openrouter.ai/) to generate context-aware content. Without an API key, it falls back to static templates.

Create a `.env` file in the project root:

```env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_MODEL=anthropic/claude-sonnet-4.6
```

> **Tip:** Get an API key at [openrouter.ai/keys](https://openrouter.ai/keys). Sonnet 4.6 is recommended for the best quality/cost ratio.

---

## Development

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

After building, the `ccsk` binary is available globally if installed via `npm link`:

```bash
npm run build && npm link
ccsk new my-app "My project" -s react,typescript
```

---

<details>
<summary><strong>Project Structure</strong></summary>

```
src/
├── index.tsx                    # CLI entry point
├── commands/
│   ├── setup.ts                 # new — full project generation
│   ├── quick-create.ts          # add — single skill creation
│   ├── validate.tsx             # validate — skill validation
│   └── list.tsx                 # list — project/skill listing
├── components/
│   ├── Header.tsx               # ASCII art gradient header
│   ├── Wizard.tsx               # Multi-step creation wizard
│   ├── StepIndicator.tsx        # Progress steps display
│   ├── ValidationReport.tsx     # Error/warning display
│   └── SkillPreview.tsx         # File tree preview
├── generators/
│   ├── ai-generator.ts          # AI-powered content generation
│   ├── claude-md.ts             # CLAUDE.md generator
│   ├── settings-json.ts         # settings.json generator
│   ├── rules.ts                 # .claude/rules/ generator
│   ├── templates.ts             # 9 skill template variants
│   ├── skill-md.ts              # Static SKILL.md fallback
│   ├── reference-md.ts          # Static reference.md fallback
│   └── examples-md.ts           # Static examples.md fallback
├── validation/
│   ├── rules.ts                 # Anthropic validation rules
│   ├── schemas.ts               # Zod schemas
│   └── validator.ts             # Validation engine
└── utils/
    ├── openrouter.ts            # OpenRouter API client
    ├── styles.ts                # Colors, gradients, symbols
    ├── animations.ts            # Spinners, typing effects
    └── fs.ts                    # File system helpers
```

</details>

<details>
<summary><strong>Built With</strong></summary>

| Dependency | Purpose |
|-----------|---------|
| [TypeScript](https://www.typescriptlang.org/) | Type-safe codebase |
| [Commander](https://github.com/tj/commander.js) | CLI argument parsing |
| [Ink](https://github.com/vadimdemedes/ink) | React-based terminal UI |
| [Zod](https://zod.dev/) | Schema validation |
| [OpenRouter](https://openrouter.ai/) | AI content generation |
| [Figlet](https://github.com/patorjk/figlet.js) | ASCII art |
| [gradient-string](https://github.com/bokub/gradient-string) | Terminal gradients |
| [picocolors](https://github.com/alexeyraspopov/picocolors) | Terminal colors |
| [fs-extra](https://github.com/jprichardson/node-fs-extra) | File operations |
| [dotenv](https://github.com/motdotla/dotenv) | Environment config |

</details>

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made for the [Claude Code](https://claude.ai/) ecosystem

</div>
