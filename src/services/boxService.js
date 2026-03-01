const Box = require('../models/Box');
const Contract = require('../models/Contract');
const User = require('../models/User');

/**
 * Service to handle Box management logic.
 */
class BoxService {
    /**
     * Get all boxes with optional filters
     */
    async getAllBoxes(filters = {}) {
        return await Box.find(filters).populate('currentTenant');
    }

    /**
     * Get a single box by ID
     */
    async getBoxById(id) {
        const box = await Box.findById(id).populate('currentTenant');
        if (!box) {
            const error = new Error('Box not found');
            error.statusCode = 404;
            throw error;
        }
        return box;
    }

    /**
     * Create a new box
     */
    async createBox(boxData) {
        return await Box.create(boxData);
    }

    /**
     * Update box details or status
     */
    async updateBox(id, updateData) {
        const box = await Box.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });

        if (!box) {
            const error = new Error('Box not found');
            error.statusCode = 404;
            throw error;
        }

        return box;
    }

    /**
     * Assign a tenant to a box and create a Contract
     */
    async assignTenant(boxId, tenantId, contractData = {}) {
        const box = await Box.findById(boxId);
        if (!box) {
            const error = new Error('Box not found');
            error.statusCode = 404;
            throw error;
        }

        if (box.status === 'Occupé') {
            const error = new Error('Box is already occupied');
            error.statusCode = 400;
            throw error;
        }

        // Verify tenant exists and is a boutique user
        const tenant = await User.findById(tenantId);
        if (!tenant) {
            const error = new Error('Tenant user not found');
            error.statusCode = 404;
            throw error;
        }

        // Update box
        box.currentTenant = tenantId;
        box.status = 'Occupé';

        // Add to box history
        box.history.push({
            tenantId,
            from: new Date(),
            contractUrl: contractData.contractUrl || ''
        });

        await box.save();

        // Link the user to this box
        tenant.shopId = box._id;
        tenant.role = 'boutique';
        await tenant.save();

        // Create a formal Contract
        const endDate = contractData.endDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1));
        const contract = await Contract.create({
            boxId: box._id,
            tenantId,
            startDate: contractData.startDate || new Date(),
            endDate,
            monthlyRent: contractData.monthlyRent || box.pricePerMonth,
            depositAmount: contractData.depositAmount || 0,
            terms: contractData.terms || '',
            contractUrl: contractData.contractUrl || '',
            status: 'Active'
        });

        return { box, contract };
    }

    /**
     * Release a tenant from a box and terminate the contract
     */
    async releaseTenant(boxId) {
        const box = await Box.findById(boxId);
        if (!box) {
            const error = new Error('Box not found');
            error.statusCode = 404;
            throw error;
        }

        if (box.status !== 'Occupé' || !box.currentTenant) {
            const error = new Error('Box has no current tenant');
            error.statusCode = 400;
            throw error;
        }

        const tenantId = box.currentTenant;

        // Close the history entry
        const openEntry = box.history.find(
            h => h.tenantId.toString() === tenantId.toString() && !h.to
        );
        if (openEntry) {
            openEntry.to = new Date();
        }

        // Clear tenant from box
        box.currentTenant = null;
        box.status = 'Libre';
        await box.save();

        // Terminate active contract
        await Contract.updateMany(
            { boxId: box._id, tenantId, status: 'Active' },
            { status: 'Terminated' }
        );

        return box;
    }

    /**
     * Get active contract for a box
     */
    async getBoxContract(boxId) {
        return await Contract.findOne({ boxId, status: 'Active' })
            .populate('tenantId')
            .populate('boxId');
    }

    /**
     * Delete a box (only if unoccupied)
     */
    async deleteBox(id) {
        const box = await Box.findById(id);
        if (!box) {
            const error = new Error('Box not found');
            error.statusCode = 404;
            throw error;
        }

        if (box.status === 'Occupé') {
            const error = new Error('Cannot delete an occupied box. Release the tenant first.');
            error.statusCode = 400;
            throw error;
        }

        await Box.findByIdAndDelete(id);
        return { message: 'Box deleted successfully' };
    }
}

module.exports = new BoxService();
