const express = require('express');
const router = express.Router();
const { Coupon } = require('../models/coupon');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const mongoose = require('mongoose');

// Admin Routes

// Get all coupons (admin)
router.get('/admin', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        console.log('GET /admin - Fetching all coupons');
        console.log('MongoDB Connection State:', mongoose.connection.readyState);
        
        // Verify database connection
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Database connection is not ready');
        }

        const coupons = await Coupon.find().sort({ createdAt: -1 });
        console.log(`Found ${coupons.length} coupons`);
        
        res.json({
            success: true,
            coupons
        });
    } catch (error) {
        console.error('Error in GET /admin:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch coupons',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Get single coupon by ID
router.get('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        console.log(`GET /:id - Fetching coupon with ID: ${req.params.id}`);
        
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid coupon ID format'
            });
        }

        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }
        res.json({
            success: true,
            coupon
        });
    } catch (error) {
        console.error(`Error in GET /:id:`, error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch coupon',
            error: error.message
        });
    }
});

// Create new coupon
router.post('/', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        console.log('POST / - Creating new coupon:', req.body);
        const coupon = new Coupon(req.body);
        await coupon.save();
        console.log('Coupon created successfully:', coupon._id);
        res.status(201).json({
            success: true,
            coupon
        });
    } catch (error) {
        console.error('Error in POST /:', error);
        res.status(400).json({
            success: false,
            message: 'Failed to create coupon',
            error: error.message
        });
    }
});

// Update coupon
router.put('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        console.log(`PUT /:id - Updating coupon with ID: ${req.params.id}`);
        
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid coupon ID format'
            });
        }

        const coupon = await Coupon.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }
        console.log('Coupon updated successfully');
        res.json({
            success: true,
            coupon
        });
    } catch (error) {
        console.error('Error in PUT /:id:', error);
        res.status(400).json({
            success: false,
            message: 'Failed to update coupon',
            error: error.message
        });
    }
});

// Delete coupon
router.delete('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        console.log(`DELETE /:id - Deleting coupon with ID: ${req.params.id}`);
        
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid coupon ID format'
            });
        }

        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }
        console.log('Coupon deleted successfully');
        res.json({
            success: true,
            message: 'Coupon deleted successfully'
        });
    } catch (error) {
        console.error('Error in DELETE /:id:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete coupon',
            error: error.message
        });
    }
});

// User Routes

// Validate coupon
router.post('/validate', authMiddleware, async (req, res) => {
    try {
        console.log('POST /validate - Validating coupon:', req.body.code);
        const { code, cartTotal } = req.body;
        
        const coupon = await Coupon.findOne({
            code: code.toUpperCase(),
            isActive: true,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        });

        if (!coupon) {
            return res.status(400).json({
                success: false,
                message: 'Invalid coupon code'
            });
        }

        // Check usage limit
        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({
                success: false,
                message: 'Coupon usage limit exceeded'
            });
        }

        // Check minimum purchase
        if (cartTotal < coupon.minPurchase) {
            return res.status(400).json({
                success: false,
                message: `Minimum purchase amount of ₹${coupon.minPurchase} required`
            });
        }

        // Calculate discount
        let discount = 0;
        if (coupon.discountType === 'PERCENTAGE') {
            discount = (cartTotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount) {
                discount = Math.min(discount, coupon.maxDiscount);
            }
        } else {
            discount = coupon.discountValue;
        }

        console.log('Coupon validated successfully');
        res.json({
            success: true,
            coupon: {
                ...coupon.toObject(),
                calculatedDiscount: discount
            }
        });
    } catch (error) {
        console.error('Error in POST /validate:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate coupon',
            error: error.message
        });
    }
});

// Apply coupon (increment usage count)
router.post('/apply', authMiddleware, async (req, res) => {
    try {
        console.log('POST /apply - Applying coupon:', req.body.code);
        const { code } = req.body;
        
        const coupon = await Coupon.findOneAndUpdate(
            { code: code.toUpperCase() },
            { $inc: { usedCount: 1 } },
            { new: true }
        );

        if (!coupon) {
            return res.status(400).json({
                success: false,
                message: 'Invalid coupon code'
            });
        }

        console.log('Coupon applied successfully');
        res.json({
            success: true,
            message: 'Coupon applied successfully'
        });
    } catch (error) {
        console.error('Error in POST /apply:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to apply coupon',
            error: error.message
        });
    }
});

module.exports = router; 