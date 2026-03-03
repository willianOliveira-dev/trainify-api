# General Coding Guidelines

## 1. Tooling & Scripts
- **Manager**: Always use `pnpm` (currently v10.30.3). Do not use `npm` or `yarn`.
- **Target OS**: The application is built for Node.js v24.x or later.
- **Linting & Formatting**: We use `@biomejs/biome`.
  - Format your code before committing (`pnpm format`).
  - Lint your code locally (`pnpm lint`).
  - Rely on Biome's fast checking instead of ESLint/Prettier.

## 2. Formatting Rules (from `biome.json`)
- Indent with **spaces** (width 2).
- Maximum line width is **100 characters**.
- Use **single quotes** for strings (except in JSX, though this is a backend API).
- Semicolons are mandatory (`"semicolons": "always"`).
- Trailing commas are mandatory (`"trailingCommas": "all"`).
- Object bracket spacing is enabled (`"bracketSpacing": true`).

## 3. Style Rules (from `biome.json`)
- **Block Statements**: Always use block statements for `if`, `for`, `while`, etc. No inline or single-line conditionals (`useBlockStatements`: "error").
- **Naming Conventions**: Strict adherence to naming conventions (`useNamingConvention`: "error"). Generally:
  - `camelCase` for variables, functions, and properties.
  - `PascalCase` for Types, Interfaces, and Classes.
  - `UPPER_SNAKE_CASE` for global constant values.
- **Cognitive Complexity**: Keep functions small and focused to avoid excessive complexity (`noExcessiveCognitiveComplexity`).
- **Clean Code**: No unused variables (`noUnusedVariables`).

## 4. Dependencies
- Imports should be organized and clean (Biome handles `organizeImports`).
- Favor dependency injection via Use Case constructors when managing modules and repositories.
- Only load Fastify plugins via `$app.register()` inside `src/plugins/` or your domain's route registry.
