# TypeScript Rules

## 1. Compiler Configuration (`tsconfig.json`)
The project uses standard modern TypeScript with strict checks:
- **`target` / `module`**: ESNext / ES2022. Node 24 target (`@tsconfig/node24`).
- **Path Aliases**: `@/` maps to `src/`. Always use absolute imports with `@/` instead of relative paths `../../`.
- **Strictness**: High strictness, including `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, and `noFallthroughCasesInSwitch`.

## 2. Fastify Type Provider (Zod)
- We use `fastify-type-provider-zod` to completely type-safe our routes.
- Define incoming payload validations (body, querystring, params, headers) using `zod`.
- The routes will be automatically typed based on the Zod schema provided in the `schema` object of the route configuration.
- Controller arguments (`request`, `reply`) automatically infer the types from the route schema. You don't need to manually type `request.body`.

## 3. Interfaces and Types
- Prefer `type` for domain models and union/intersection compositions.
- Prefer `interface` when defining extensible objects (like Fastify plugin options or augmenting external libraries).
- Define Drizzle schema types for inserts and selects using `typeof schema.$inferSelect` and `typeof schema.$inferInsert`.
- Do not use `any`. Use `unknown` if the type is truly unknown, and validate it using Zod before interacting with it.

## 4. Error Handling
- Use structured error responses.
- Rely on Fastify Zod's `validatorCompiler` to automatically reject invalid inputs with a 400 Bad Request.
- Handle business exceptions explicitly in Use Cases, returning standard JSON error objects from controllers.
