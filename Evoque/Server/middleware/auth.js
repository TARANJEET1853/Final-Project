const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        console.log('Auth Middleware - Token:', token ? 'Present' : 'Missing');
        
        if (!token) {
            console.log('Auth Middleware - No token provided');
            return res.status(401).json({
                success: false,
                message: 'No token, authorization denied'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Auth Middleware - Token verified, user:', decoded.userId);
        
        // Add user from payload
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Auth Middleware - Error:', error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired'
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token format'
            });
        }
        res.status(401).json({
            success: false,
            message: 'Token is not valid'
        });
    }
}; 