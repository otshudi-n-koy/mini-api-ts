# Copilot Instructions for AI Coding Agents

## Project Overview
This is a TypeScript-based REST API project with PostgreSQL as the database, containerized for Kubernetes deployment. The codebase is organized for clarity and maintainability, with a focus on modularity and explicit data flow.

## Architecture & Major Components
- **src/**: Main application code.
  - `db.ts`: Database connection and query logic.
  - `index.ts`: API server entry point.
  - `models/`: Data models and schema definitions.
  - `routes/`: API route handlers (e.g., `users.ts`).
  - `types/`: TypeScript type definitions (e.g., `user.ts`).
- **scripts/**: Database reset and migration scripts (`reset.sql`, `reset.ts`).
- **k8s/** & **kubernetes/**: Kubernetes manifests for database and API deployment, secrets, configs, and jobs.
- **Dockerfile**: Containerization for local and cloud environments.

## Developer Workflows
- **Build**: Use `npm run build` to compile TypeScript.
- **Test**: Use `npm run test` for unit tests. For DB tests, use `npm run db:test` (see `test-db.ts`).
- **Database Reset**: Run `npm run db:reset` or use scripts in `scripts/` for local DB resets.
- **Kubernetes**: Deploy using manifests in `k8s/` or `kubernetes/`. Use `kubectl` for management.
- **Linting**: Run `npm run lint` (uses `eslint.config.js`).

## Patterns & Conventions
- **Type Safety**: All API routes and models use explicit TypeScript types from `types/`.
- **Separation of Concerns**: Route handlers do not contain business logic; use models and DB utilities.
- **Environment Variables**: Managed via Kubernetes secrets and config maps; see `postgres-secret.yaml` and `postgres-config.yaml`.
- **SQL Initialization**: Use `init.sql` and `postgres-init-sql.yaml` for DB bootstrapping.
- **Testing**: DB tests are isolated in `test-db.ts` and use a separate test database.

## Integration Points
- **PostgreSQL**: All DB access via `db.ts`, configured for both local and Kubernetes environments.
- **Kubernetes**: Manifests support both development and production setups; secrets/configs are not hardcoded.
- **Docker**: The `Dockerfile` builds the API for containerized deployment.

## Examples
- To add a new API route: create a file in `src/routes/`, define the handler, and update `index.ts` to register it.
- To add a new model: create a file in `src/models/` and corresponding types in `src/types/`.

## Quick Reference
- Build: `npm run build`
- Test: `npm run test`, `npm run db:test`
- Lint: `npm run lint`
- DB Reset: `npm run db:reset`
- Kubernetes: `kubectl apply -f k8s/` or `kubernetes/`

---

If any section is unclear or missing, please provide feedback for further refinement.