import admin from 'firebase-admin';
import logger from '../utils/logger.js';

const initFirebase = () => {
    try {
        if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
            logger.warn('FIREBASE_SERVICE_ACCOUNT not found in environment variables. Firebase Admin might not be initialized correctly.');
            // In a real scenario, you might want to throw an error if this is strictly required.
            return;
        }

        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });

        logger.info('Firebase Admin initialized successfully');
    } catch (error) {
        logger.error(`Error initializing Firebase Admin: ${error.message}`);
    }
};

export { initFirebase, admin };
