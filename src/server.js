import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';
import { initFirebase } from './config/firebase.js';
import logger from './utils/logger.js';

const PORT = process.env.PORT || 3000;

// Initialize Database and Services
const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Initialize Firebase Admin
    initFirebase();

    // 3. Start Listening
    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    // Handle Graceful Shutdown
    const shutdown = () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error(`Critical Error during startup: ${error.message}`);
    process.exit(1);
  }
};

startServer();
