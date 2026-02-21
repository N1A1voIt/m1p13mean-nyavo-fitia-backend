require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Box = require('../models/Box');
const Product = require('../models/Product');
const Sale = require('../models/Sale');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🌱 Connecting for Seeding...');

        // Clear existing data - Drop collections to purge old indices
        // Be careful: this will fail if collection doesn't exist, so we use try/catch
        const collections = ['users', 'boxes', 'products', 'sales'];
        for (const col of collections) {
            try {
                await mongoose.connection.db.dropCollection(col);
                console.log(`🧹 Dropped collection: ${col}`);
            } catch (e) {
                // If collection doesn't exist, ignore
                console.log(`ℹ️ Collection ${col} not found or already dropped.`);
            }
        }

        console.log('✨ Database Deep Cleaned (Indices Purged)');

        // 1. Create a physical Location (Box) first
        const box1 = await Box.create({
            boxNumber: 'A101',
            location: { floor: 0, zone: 'Aile Nord' },
            type: 'Boutique',
            status: 'Occupé',
            pricePerMonth: 500000
        });

        // 2. Create the Boutique Owner User
        const boutique = await User.create({
            name: 'Elena Fashion',
            email: 'shop@mall.mg',
            password: 'password123',
            role: 'boutique',
            shopId: box1._id,
            firebaseUid: 'seed-f-uid-1'
        });

        // 3. Update Box with its Tenant
        box1.currentTenant = boutique._id;
        box1.history.push({ tenantId: boutique._id, from: new Date() });
        await box1.save();

        // 4. Create an Admin
        await User.create({
            name: 'System Administrator',
            email: 'admin@mall.mg',
            password: 'password123',
            role: 'admin',
            firebaseUid: 'seed-a-uid-2'
        });

        // 5. Create a Client
        await User.create({
            name: 'Sarah Client',
            email: 'client@mall.mg',
            password: 'password123',
            role: 'client',
            firebaseUid: 'seed-c-uid-3'
        });

        // 6. Create Products for the Boutique
        await Product.insertMany([
            { shopId: box1._id, name: 'Sac à main Cuir', price: 150000, category: 'Fashion', sku: 'HB-001', stock: 15, active: true },
            { shopId: box1._id, name: 'Robe d\'été', price: 85000, category: 'Fashion', sku: 'DR-002', stock: 10, active: true },
            { shopId: box1._id, name: 'Montre Élégance', price: 320000, category: 'Tech/Fashion', sku: 'WT-003', stock: 5, active: true }
        ]);

        console.log('✅ Seeding Complete! Credentials: admin@mall.mg / password123');
        process.exit();
    } catch (err) {
        console.error('❌ Seeding Error:', err);
        process.exit(1);
    }
};

seedData();
