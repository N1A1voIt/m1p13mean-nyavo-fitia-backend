import logger from '../utils/logger.js';
import { errorResponse } from '../utils/response.js';

/**
 * Global error handling middleware.
 */
const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    if (status === 500) {
        logger.error({
            message: err.message,
            stack: err.stack,
            path: req.path,
            method: req.method,
        });
    } else {
        logger.warn({
            message: err.message,
            path: req.path,
            method: req.method,
        });
    }

    res.status(status).json(errorResponse(message, status));
};

export default errorHandler;
