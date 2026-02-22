import { admin } from '../config/firebase.js';
import User, { ROLES } from '../models/user.model.js';
import Shop from '../models/shop.model.js';

/**
 * Service to handle authentication business logic.
 */
class AuthService {
    /**
     * Authenticates a user.
     * If idToken is provided, it verifies it.
     * If email/password are provided, it uses Firebase Identity Toolkit REST API.
     */
    async login(credentials) {
        const { email, password, idToken } = credentials;
        let uid;

        if (idToken) {
            const decodedToken = await this.verifyFirebaseToken(idToken);
            uid = decodedToken.uid;
        } else {
            // Manual Login using Firebase REST API
            const apiKey = process.env.FIREBASE_API_KEY;
            if (!apiKey) {
                const error = new Error('FIREBASE_API_KEY is not configured in the backend');
                error.status = 500;
                throw error;
            }

            const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, returnSecureToken: true }),
            });

            const data = await response.json();

            if (!response.ok) {
                const error = new Error(data.error?.message || 'Authentication failed');
                error.status = 401;
                throw error;
            }

            uid = data.localId;
            // Note: In a real app, you'd want to return the idToken from data to the frontend
            // so they can use it in Subsequent Bearer headers.
            return { uid, idToken: data.idToken, refreshToken: data.refreshToken };
        }

        return { uid };
    }

    /**
     * Verifies a Firebase ID Token.
     */
    async verifyFirebaseToken(idToken) {
        return await admin.auth().verifyIdToken(idToken);
    }

    /**
     * Synchronizes a Firebase user with the MongoDB database.
     * @param {object} decodedToken 
     * @returns {Promise<object>} The user document
     */
    async syncUserWithMongo(decodedToken) {
        const { uid, email, name, picture, firebase } = decodedToken;

        let user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            // New user registration
            user = await User.create({
                firebaseUid: uid,
                email: email,
                name: name || '',
                provider: firebase.sign_in_provider === 'password' ? 'password' : 'google',
                role: ROLES.USER, // Default role
            });
        } else {
            // Update existing user if necessary
            user.name = name || user.name;
            // We could also update the provider if it changed, though usually it's static per UID
            await user.save();
        }

        return user;
    }

    /**
     * Registers a new user or shop.
     * If idToken is provided, it syncs a social login.
     * If email/password are provided, it creates the user in Firebase and Mongo.
     * @param {object} userData 
     */
    async register(userData) {
        const { email, password, name, username, role, shopName, idToken } = userData;
        let uid;
        let provider = 'password';

        if (idToken) {
            // Social Login Sync
            const decodedToken = await this.verifyFirebaseToken(idToken);
            uid = decodedToken.uid;
            provider = decodedToken.firebase.sign_in_provider === 'password' ? 'password' : 'google';
        } else {
            // Manual Email/Password Creation
            try {
                const firebaseUser = await admin.auth().createUser({
                    email,
                    password,
                    displayName: name,
                });
                uid = firebaseUser.uid;
            } catch (error) {
                if (error.code === 'auth/email-already-exists') {
                    error.status = 400;
                    error.message = 'An account with this email already exists in Firebase';
                }
                throw error;
            }
        }

        // Check if user already exists in MongoDB
        let user = await User.findOne({ firebaseUid: uid });
        if (user) {
            const error = new Error('User already exists in database');
            error.status = 400;
            throw error;
        }

        // Create User in MongoDB
        user = await User.create({
            firebaseUid: uid,
            email: email,
            name: name,
            username: username,
            provider: provider,
            role: role === 'shop' ? ROLES.SHOP : ROLES.USER,
        });

        // If role is shop, create Shop entry
        if (role === 'shop') {
            const shopRef = `SHOP-${uid.substring(0, 5).toUpperCase()}-${Date.now().toString().slice(-4)}`;
            await Shop.create({
                tenantId: uid,
                name: shopName || `${name}'s Shop`,
                shopRef: shopRef,
            });
        }

        return user;
    }

    /**
     * Get user by Firebase UID.
     */
    async getUserByUid(uid) {
        return await User.findOne({ firebaseUid: uid });
    }
}

export default new AuthService();
