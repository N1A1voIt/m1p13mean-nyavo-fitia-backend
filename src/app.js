import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import v1Routes from './routes/v1/index.js';
import errorHandler from './middlewares/error.middleware.js';
import limiter from './middlewares/rateLimit.middleware.js';
import { setupSwagger } from './config/swagger.js';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(limiter);

// Payload Parsers
app.use(express.json());

// Swagger Documentation
setupSwagger(app);

// API Routes
app.use('/api/v1', v1Routes);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 Handler
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.status = 404;
    next(error);
});

// Global Error Handler
app.use(errorHandler);

export default app;
