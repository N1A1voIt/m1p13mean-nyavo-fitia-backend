const UtilityReading = require('../models/UtilityReading');
const Invoice = require('../models/Invoice');

/**
 * Service to handle Utility readings and refacturation logic.
 */
class UtilityService {
    /**
     * Get readings for a box
     */
    async getReadingsByBox(boxId) {
        return await UtilityReading.find({ boxId }).sort({ readingDate: -1 });
    }

    /**
     * Create a new reading and calculate consumption
     */
    async addReading(data) {
        const { boxId, type, meterId, currentIndex, previousIndex } = data;

        const consumption = currentIndex - previousIndex;
        if (consumption < 0) {
            const error = new Error('Current index cannot be lower than previous index');
            error.statusCode = 400;
            throw error;
        }

        const reading = await UtilityReading.create({
            boxId,
            type,
            meterId,
            previousIndex,
            currentIndex,
            consumption
        });

        return reading;
    }

    /**
     * Generate invoices for pending readings
     */
    async generateUtilityInvoices() {
        const pendingReadings = await UtilityReading.find({ invoiceStatus: 'Pending' }).populate({
            path: 'boxId',
            populate: { path: 'currentTenant' }
        });

        const invoices = [];
        const rates = {
            'Electric': 500, // Example rate per unit
            'Water': 200     // Example rate per unit
        };

        for (const reading of pendingReadings) {
            if (!reading.boxId.currentTenant) continue;

            const amount = reading.consumption * rates[reading.type];
            const month = reading.readingDate.getMonth() + 1;
            const year = reading.readingDate.getFullYear();

            const invoice = await Invoice.create({
                invoiceNumber: `UTL-${reading.type.charAt(0)}-${year}-${month}-${reading.boxId.boxNumber}`,
                tenantId: reading.boxId.currentTenant,
                boxId: reading.boxId._id,
                amount: amount,
                type: reading.type === 'Electric' ? 'Charge_Jiro' : 'Charge_Rano',
                dueDate: new Date(new Date().setDate(new Date().getDate() + 5))
            });

            reading.invoiceStatus = 'Invoiced';
            await reading.save();
            invoices.push(invoice);
        }

        return invoices;
    }
}

module.exports = new UtilityService();
