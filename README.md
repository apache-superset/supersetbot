# supersetbot

<img width="300" alt="Screenshot 2024-04-02 at 11 03 46 PM" src="https://github.com/apache-superset/supersetbot/assets/487433/c3eb1414-f760-48d3-8a69-c99788247966">


supersetbot is a utility bot that streamlines GitHub operations, CI/CD workflows, and release management for Apache Superset.

The bot can be used as a local CLI OR, for a subset of fitted use cases, can be invoked directly from GitHub comments using `@supersetbot` commands.

Because it's its own npm app, it can be tested/deployed/used in isolation from the rest of Superset, and take on some of the complexity from GitHub actions and onto a nifty utility that can be used in different contexts.

## Prerequisites

- Node.js 20 or higher
- npm or yarn
- Git
- GitHub personal access token (for GitHub operations)

## Installation

### Global Installation
```bash
nvm use 20
npm install -g supersetbot
```

### Local Development
```bash
git clone https://github.com/apache-superset/supersetbot.git
cd supersetbot
nvm use 20
npm install
```

## Features

### Available Commands

```bash
supersetbot [options] [command]

Global Options:
  -v, --verbose                      Output extra debugging information
  -r, --repo <repo>                  The GitHub repo to use (ie:"apache/superset")
  -d, --dry-run                      Run the command in dry-run mode
  -a, --actor <actor>                The actor
  -h, --help                         display help for command
```

#### Label Management

**Add a label to an issue or PR**
```bash
supersetbot label "v3.0" -i 12345
supersetbot label "enhancement" -i 12345 -r apache/superset
```

**Remove a label from an issue or PR**
```bash
supersetbot unlabel "needs-review" -i 12345
```

**Add organization label based on author**
```bash
supersetbot orglabel -i 12345
```

#### Release Management

**Auto-label a PR with its release version**
```bash
supersetbot release-label-pr 12345
supersetbot release-label-pr 12345 --exclude-cherries  # Exclude cherry-picked commits
```

**Batch label PRs for a specific release**
```bash
supersetbot release-label v3.0.0
```

**Auto-label multiple merged PRs**
```bash
supersetbot release-label-prs --search "merged:>2024-01-01" --pages 5
```

#### Python Dependencies

**Bump Python dependencies**
```bash
# Update all dependencies
supersetbot bump-python

# Update specific package
supersetbot bump-python -p pandas

# Update a group of dependencies
supersetbot bump-python -g dev

# Create PRs with limits
supersetbot bump-python --limit 5 --only-base
```

#### Docker Operations

**Generate Docker build commands**
```bash
# Build lean image
supersetbot docker --preset lean --platform linux/amd64

# Build for multiple platforms
supersetbot docker --preset dev --platform linux/amd64 linux/arm64

# Build and push
supersetbot docker --preset lean --push --context release --context-ref v3.0.0
```

#### Utility Commands

**Get version**
```bash
supersetbot version
```

## GitHub Integration

supersetbot can be invoked directly from GitHub comments in issues and PRs:

```
@supersetbot label v3.0
@supersetbot orglabel
@supersetbot release-label-pr 12345
```

The bot will process the command and respond with a comment containing the results.

## Architecture

supersetbot follows a modular architecture designed for extensibility and maintainability:

### Core Components

- **CLI Interface** (`src/cli.js`): Commander.js-based CLI that defines all available commands
- **Context Manager** (`src/context.js`): Handles execution context (CLI vs GitHub Actions) and manages logging
- **GitHub Client** (`src/github.js`): Octokit-based GitHub API wrapper with rate limiting and throttling
- **Git Operations** (`src/git.js`): Release management and PR analysis using simple-git
- **Docker Builder** (`src/docker.js`): Docker command generation for various build presets
- **Utilities** (`src/utils.js`): Shared helper functions and shell command execution

### Key Design Patterns

- **Context-Aware Execution**: Commands behave differently based on execution environment
- **Dry-Run Support**: All destructive operations support `--dry-run` for safety
- **Verbose Logging**: Detailed debug output available with `--verbose` flag
- **Error Resilience**: Graceful error handling with informative messages

## Development

### Running Locally

```bash
# Run from source
./src/supersetbot [command]

# Run tests
npm test

# Lint code
npm run lint
```

### Environment Variables

- `GITHUB_TOKEN`: Required for GitHub API operations
- `GITHUB_REPOSITORY`: Default repository (e.g., "apache/superset")
- `GITHUB_ACTOR`: The user performing the action
- `GITHUB_ISSUE_NUMBER`: Default issue/PR number for commands

### Testing

supersetbot uses Jest with ES modules support:

```bash
# Run all tests
npm test

# Run specific test file
npm test src/utils.test.js

# Run with coverage
npm test -- --coverage
```

Test files follow the `*.test.js` naming convention and are colocated with source files.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting
5. Commit your changes
6. Push to your fork
7. Open a Pull Request

### Code Style

- ES modules with `import`/`export` syntax
- ESLint with Airbnb configuration
- Async/await for asynchronous operations
- Commander.js for CLI structure

## License

Licensed under the Apache License, Version 2.0. See the [LICENSE](LICENSE) file for details.
