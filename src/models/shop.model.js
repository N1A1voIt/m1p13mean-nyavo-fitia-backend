import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema({
    tenantId: {
        type: String, // Firebase UID of the owner
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    shopRef: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    boxId: {
        type: String,
        trim: true,
    }
}, {
    timestamps: true,
});

const Shop = mongoose.model('Shop', shopSchema);

export default Shop;
