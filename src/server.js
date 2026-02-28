require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')); // Logging
}

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/shop-requests', require('./routes/shopRequestRoutes'));
// app.use('/api/boxes', require('./routes/boxRoutes'));
// app.use('/api/billing', require('./routes/billingRoutes'));
// app.use('/api/utilities', require('./routes/utilityRoutes'));
// app.use('/api/finance', require('./routes/financeRoutes'));
// app.use('/api/rh', require('./routes/rhRoutes'));
// app.use('/api/events', require('./routes/eventRoutes'));
// app.use('/api/shop-erp', require('./routes/shopERPRoutes'));
// app.use('/api/sales', require('./routes/saleRoutes'));
// app.use('/api/orders', require('./routes/orderRoutes'));
// app.use('/api/map', require('./routes/mapRoutes'));
// app.use('/api/loyalty', require('./routes/loyaltyRoutes'));
// app.use('/api/reservations', require('./routes/reservationRoutes'));
// app.use('/api/notifications', require('./routes/notificationRoutes'));
// app.use('/api/cart', require('./routes/cartRoutes'));

// Basic Health Route
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Maal Management API is live 🚀' });
});

// ===== Scheduled Jobs =====
// Run daily billing check every 24h (on startup + interval)
// const { runDailyBillingCheck } = require('../execution/jobs/billingCron');
// mongoose.connection.once('open', () => {
    // Run once on startup (after DB is connected)
    // setTimeout(() => {
    //     runDailyBillingCheck().catch(err => console.error('[STARTUP CRON]', err.message));
    // }, 5000);

    // Then every 24 hours
    // setInterval(() => {
    //     runDailyBillingCheck().catch(err => console.error('[DAILY CRON]', err.message));
    // }, 24 * 60 * 60 * 1000);
// });

// 404 Handler
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
});

// Global Error Handler
app.use(errorMiddleware);

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
});
