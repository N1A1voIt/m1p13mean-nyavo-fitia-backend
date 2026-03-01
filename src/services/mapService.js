const Box = require('../models/Box');

/**
 * Service to handle Client-facing Map and Directory logic.
 */
class MapService {
    /**
     * Get all active shops for the map
     */
    async getMapShops() {
        return await Box.find()
            .select('boxNumber location type status currentTenant')
            .populate('currentTenant', 'name');
    }

    /**
     * Get detailed info for a map point
     */
    async getMapPointDetail(boxId) {
        return await Box.findById(boxId)
            .populate('currentTenant');
    }
}

module.exports = new MapService();
