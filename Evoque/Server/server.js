const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { corsMiddleware, ensureCorsHeaders } = require("./middleware/cors");
require("dotenv/config")
const { ping } = require("./utils/keepAlive");

// MongoDB Debug
mongoose.set('debug', true);

// MongoDB connection options
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4,
    maxPoolSize: 10
};

// MongoDB connection with retry logic and debug logging
const connectWithRetry = async () => {
    const maxRetries = 3;
    let retryCount = 0;

    const tryConnect = async () => {
        try {
            console.log(`MongoDB connection attempt ${retryCount + 1} of ${maxRetries}`);
            console.log('Connection string:', process.env.CONNECTION_STRING?.substring(0, 20) + '...');
            
            await mongoose.connect(process.env.CONNECTION_STRING, mongooseOptions);
            
            console.log("Database Connected Successfully!");
            console.log('MongoDB Connection State:', mongoose.connection.readyState);
            console.log('MongoDB Connection Details:', {
                host: mongoose.connection.host,
                port: mongoose.connection.port,
                name: mongoose.connection.name
            });

            // Set up MongoDB connection error handlers
            mongoose.connection.on('error', (err) => {
                console.error('MongoDB runtime error:', err);
            });

            mongoose.connection.on('disconnected', () => {
                console.log('MongoDB disconnected. Attempting to reconnect...');
                setTimeout(tryConnect, 5000);
            });

            return true;
        } catch (err) {
            console.error("Database Connection Failed!");
            console.error("Error details:", err);
            
            if (retryCount < maxRetries - 1) {
                retryCount++;
                console.log(`Retrying connection in 5 seconds... (Attempt ${retryCount + 1} of ${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, 5000));
                return tryConnect();
            }
            
            console.error('Max retries reached. Could not connect to MongoDB.');
            return false;
        }
    };

    return tryConnect();
};

// Apply CORS middleware before routes
app.use(corsMiddleware);
app.use(ensureCorsHeaders);

// Handle preflight requests
app.options('*', corsMiddleware);

// Middleware
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// Request logging middleware
app.use((req, res, next) => {
    console.log('\n--- Incoming Request ---');
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`${req.method} ${req.path}`);
    console.log('Headers:', JSON.stringify({
        authorization: req.headers.authorization ? 'Bearer [REDACTED]' : 'None',
        origin: req.headers.origin,
        'content-type': req.headers['content-type']
    }, null, 2));
    next();
});

// Routes
const categoryRoute = require("./routes/category");
const productRoute = require("./routes/products");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const ordersRoute = require("./routes/orders");
const couponsRoute = require("./routes/coupons");
const authMiddleware = require("./middleware/auth");

// Enhanced health check endpoint
app.get('/api/health', (req, res) => {
    const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    res.json({ 
        status: 'ok', 
        time: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        env: process.env.NODE_ENV,
        dbStatus: dbState[mongoose.connection.readyState],
        dbDetails: {
            host: mongoose.connection.host,
            name: mongoose.connection.name,
            port: mongoose.connection.port,
            models: Object.keys(mongoose.models)
        }
    });
});

// Protected routes (require authentication)
app.use('/api/auth', authRoute);
app.use('/api/user', authMiddleware, userRoute);
app.use('/api/category', authMiddleware, categoryRoute);
app.use('/api/products', authMiddleware, productRoute);
app.use('/api/orders', ordersRoute);
app.use('/api/coupons', couponsRoute);

// Enhanced error handling middleware
app.use((err, req, res, next) => {
    console.error('\n--- Error Occurred ---');
    console.error('Time:', new Date().toISOString());
    console.error('Path:', req.path);
    console.error('Error:', {
        name: err.name,
        message: err.message,
        code: err.code
    });
    console.error('Stack:', err.stack);
    console.error('--------------------\n');

    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Something went wrong!',
        path: req.path,
        timestamp: new Date().toISOString()
    });
});

// Start server only after successful database connection
const startServer = async () => {
    const isConnected = await connectWithRetry();
    if (isConnected) {
        const port = process.env.PORT || 3000;
        const server = app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
            console.log('CORS enabled for origins:', corsMiddleware.origin);
            console.log('Environment:', process.env.NODE_ENV);
            
            // Start the keep-alive ping
            if (process.env.NODE_ENV === 'production') {
                ping();
                console.log('Keep-alive ping service started');
            }
        });

        // Handle server shutdown gracefully
        process.on('SIGTERM', () => {
            console.log('SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                console.log('Server closed');
                mongoose.connection.close(false, () => {
                    console.log('MongoDB connection closed');
                    process.exit(0);
                });
            });
        });

        return server;
    } else {
        console.error('Could not start server due to database connection failure');
        process.exit(1);
    }
};

// Start the server
startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
