# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

supersetbot is a utility bot for Apache Superset that helps with GitHub, CI, and related tasks. It can be used as a local CLI or invoked directly from GitHub comments for specific use cases.

## Development Commands

### Install and Run
```bash
nvm use 20
npm install
./src/supersetbot  # or: npm run supersetbot
```

### Testing
```bash
npm test  # Runs Jest tests with experimental VM modules
```

### Linting
```bash
npm run lint  # Runs ESLint on all files
```

## Architecture

### Core Components

- **CLI Interface** (`src/cli.js`): Commander-based CLI that defines all available commands and options
- **Context** (`src/context.js`): Manages execution context (CLI vs GitHub Actions) and handles logging/output
- **GitHub Integration** (`src/github.js`): Octokit-based GitHub API interactions with throttling support
- **Git Operations** (`src/git.js`): Release management and PR labeling logic using simple-git
- **Docker** (`src/docker.js`): Docker build command generation for CI/CD pipelines

### Command Categories

1. **Labeling Commands**: Add/remove labels, org labels, release labels
2. **Release Management**: Auto-label PRs with release versions
3. **Dependency Management**: Bump Python dependencies via automated PRs
4. **Docker Operations**: Generate Docker build commands for various presets

### Key Design Patterns

- Commands are conditionally available based on execution context (CLI vs GitHub Actions)
- Dry-run mode is supported across all commands for safety
- Verbose mode provides detailed debugging output
- The bot can parse commands from GitHub comments starting with `@supersetbot`

## Testing Approach

- Jest is configured for ES modules with `--experimental-vm-modules`
- Test files follow the `*.test.js` naming convention
- Tests exist for core modules: cli, docker, utils, and index

## Important Notes

- The bot requires Node.js 20 or higher
- Uses ES modules (`"type": "module"` in package.json)
- GitHub authentication is handled via environment variables
- Rate limiting is built into GitHub API calls via @octokit/plugin-throttling