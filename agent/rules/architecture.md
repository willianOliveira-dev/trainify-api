# Architecture Rules

## 1. Top-Level Structure
The project follows a modular architecture based on Fastify and Drizzle ORM.
- **`src/app.ts`**: Fastify application factory. Bootstraps plugins, schemas, type providers, and the main router.
- **`src/server.ts`**: Entry point. Handles OS signals for graceful shutdown and starts the server.
- **`src/config/env.ts`**: Centralized environment variable parsing and validation using Zod.
- **`src/db/`**: Database configuration containing Drizzle schemas (`schemas/`), connection setup, and seeders.
- **`src/plugins/`**: Fastify plugins encapsulation (e.g., CORS, Swagger, Auth, Rate Limiting).
- **`src/modules/`**: The core business logic, divided by domains.

## 2. Module Structure (Domain-Driven)
Each business domain inside `src/modules/` (e.g., `workout-plans`, `auth`) follows a stratified architecture:
- **`routes/`**: Fastify route definitions. Registers endpoints and binds them to controllers.
- **`controllers/`**: HTTP layer. Extracts data from requests and passes it to use-cases, handling responses.
- **`use-cases/`**: Core business logic. Contains application rules and orchestrates repositories.
- **`repository/`**: Data access layer. Handles Drizzle ORM queries to abstract DB operations from use-cases.
- **`schemas/`**: Drizzle schema definitions specific to the module, or validation schemas (Zod).
- **`dto/`**: Data Transfer Objects (Zod schemas) for request/response validation.

## 3. Routing
- All module routes must be registered in `src/modules/index.route.ts`.
- Use Fastify's plugin system `app.register(router)` for encapsulation.
- API endpoints should generally be prefixed with `/api/v1` except for documentation or auth callbacks.

## 4. Database (Drizzle ORM)
- Schemas must be exported and aggregated in `src/db/schemas/index.ts`.
- Migrations are handled via `drizzle-kit` (`pnpm drizzle:migrate`).
- Use Neon Serverless driver for connections.
