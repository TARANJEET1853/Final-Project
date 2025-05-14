const { User } = require('../models/user');
const mongoose = require('mongoose');

module.exports = async (req, res, next) => {
    try {
        console.log('Admin Middleware - Checking user:', req.user?.userId);
        
        if (!req.user || !req.user.userId) {
            console.log('Admin Middleware - No user data in request');
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(req.user.userId)) {
            console.log('Admin Middleware - Invalid user ID format');
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

        const user = await User.findById(req.user.userId);
        console.log('Admin Middleware - User found:', user ? 'Yes' : 'No');
        
        if (!user) {
            console.log('Admin Middleware - User not found');
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        if (!user.isAdmin) {
            console.log('Admin Middleware - User is not admin');
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        console.log('Admin Middleware - Access granted for admin user');
        next();
    } catch (error) {
        console.error('Admin Middleware - Error:', error);
        console.error('Admin Middleware - Stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error checking admin status',
            error: error.message
        });
    }
}; 