# Express.js Backend Standards

## Tech Stack
- Node.js version: >= v22.22.0 (Use ESM modules, no CommonJS/require)
- Framework: Express 5.2.1
- Validation: Zod (Strictly validate all `req.body` and `req.params`)
- Database: Mongoose (MongoDB)
- Testing: Vitest

## Architecture Rules
- **Controller/Service Pattern:** Keep controllers thin. Move all business logic to `/services`.
- **Global Error Handling:** Use a centralized error-handling middleware. Never use try/catch blocks that just log; always pass to `next(err)`.
- **Response Shape:** All successful API responses must follow: `{ "success": true,"status":200 or else, "data": { ... } }`.
- **No Floating Promises:** Always await async calls or handle `.catch()`.

## Security Guardrails
- **No Secrets:** Never hardcode keys. Use `process.env`.
- **Rate Limiting:** Every public route needs `express-rate-limit`.
- **Security Headers:** Always include `helmet` middleware.

## Forbidden Patterns
- DO NOT use `body-parser` (use built-in `express.json()`).
- DO NOT use `var`.
- DO NOT use `console.log` for production errors; use a structured logger like `pino`.

## API Design Standards
- **RESTful Naming:** Use nouns for resources (e.g., `/users`, not `/getUsers`).
- **Versioning:** Prefix all routes with `/api/v1`.
- **Status Codes:** - 200/201 for Success
  - 400 for Validation Errors (Zod)
  - 401 for Auth issues
  - 404 for Not Found
  - 500 for Server Crashes
- **Pagination:** All GET requests that return lists must support `limit` and `page` query parameters.
- **Idempotency:** Ensure PUT and DELETE operations can be called multiple times without side effects.

## Implementation Standards
- **Don't Repeat Yourself (DRY):** Extract common logic (like checking if a user exists) into reusable middleware or service functions.
- **Pure Functions:** Business logic in `/services` should be pure where possible, making it easy to unit test.
- **Explicit Types:** If using TypeScript, avoid `any` at all costs. Define Interfaces/Types for all request bodies and database models.
- **Early Returns:** Use early returns to keep nesting low. 
  - *Bad:* `if (user) { if (password) { ... } }`
  - *Good:* `if (!user) return next(new Error('No user'));`
- **Graceful Shutdown:** Include logic to close database connections when the Node process receives a `SIGTERM`.