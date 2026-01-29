# AGENTS.md

## Build/lint/test commands
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Test**: `npm test`
- **Single Test**: `npm test -- <test-file-path>:<test-suite-name>`

## Code style guidelines
### Imports
- Use ES6 imports: `import { Component } from 'react';`
- Group related imports: `import React, { useState, useEffect } from 'react';`

### Formatting
- Use Prettier for formatting with `.prettierrc` configuration.
- Run `npm run format` to format the codebase.

### Types
- Use TypeScript for type safety.
- Define types/interfaces for props and states.

### Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Variables/Functions**: camelCase (e.g., `getUserProfile`)
- **Constants**: ALL_UPPERCASE_WITH_UNDERSCORES (e.g., `MAX_USERS`)

### Error Handling
- Use try/catch blocks for error handling.
- Log errors with descriptive messages using a logger library like `winston` or `pino`.

## Cursor Rules
If you find any Cursor rules in `.cursor/rules/` or `.cursorrules`, make sure to include them here as well.

## Copilot Rules
If there are Copilot rules in `.github/copilot-instructions.md`, include them here.