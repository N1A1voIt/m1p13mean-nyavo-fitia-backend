const Loyalty = require('../models/Loyalty');

/**
 * Service to handle Client Loyalty Program logic.
 */
class LoyaltyService {
    /**
     * Get user loyalty record or create one
     */
    async getLoyaltyRecord(userId) {
        try {
            let record = await Loyalty.findOneAndUpdate(
                { userId },
                {
                    $setOnInsert: {
                        userId,
                        qrCode: `LOY-${userId.toString().substring(0, 8)}-${Date.now()}`
                    }
                },
                { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
            );
            
            if (record && !record.qrCode) {
                record.qrCode = `LOY-${userId.toString().substring(0, 8)}-${Date.now()}`;
                await record.save();
            }
            
            return record;
        } catch (error) {
            if (error.code === 11000) {
                // If a duplicate key error occurred globally due to a unique index race condition
                return await Loyalty.findOne({ userId });
            }
            throw error;
        }
    }

    /**
     * Add points to user account
     */
    async addPoints(userId, points, description) {
        const record = await this.getLoyaltyRecord(userId);

        record.points += points;
        record.history.push({
            points,
            type: 'Earned',
            description
        });

        // Simple tier logic
        if (record.points > 1000) record.tier = 'Gold';
        else if (record.points > 500) record.tier = 'Silver';

        await record.save();
        return record;
    }

    /**
     * Redeem points
     */
    async redeemPoints(userId, points, description) {
        const record = await this.getLoyaltyRecord(userId);
        if (record.points < points) {
            const error = new Error('Insufficient points');
            error.statusCode = 400;
            throw error;
        }

        record.points -= points;
        record.history.push({
            points: -points,
            type: 'Redeemed',
            description
        });

        await record.save();
        return record;
    }
}

module.exports = new LoyaltyService();
