/**
 * Formats a successful API response.
 * @param {any} data - The data to return.
 * @param {number} status - The HTTP status code.
 * @returns {object}
 */
export const successResponse = (data, status = 200) => ({
    success: true,
    status,
    data,
});

/**
 * Formats an error API response.
 * @param {string} message - The error message.
 * @param {number} status - The HTTP status code.
 * @returns {object}
 */
export const errorResponse = (message, status = 500) => ({
    success: false,
    status,
    error: message,
});
