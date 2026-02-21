/**
 * Async Handler Middleware
 * Wraps async controller functions to catch errors and pass them to the global error handler.
 * This prevents the need for repetitive try/catch blocks and ensures the server doesn't crash.
 */
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
