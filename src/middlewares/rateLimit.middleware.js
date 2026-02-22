import rateLimit from 'express-rate-limit';
import { errorResponse } from '../utils/response.js';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        res.status(options.statusCode).json(errorResponse(options.message, options.statusCode));
    },
});

export default limiter;
