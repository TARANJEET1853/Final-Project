const express = require('express');
const router = express.Router();
const { Order } = require('../models/order');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Create new order
router.post('/', authMiddleware, async (req, res) => {
    try {
        console.log('Creating order with user:', req.user);
        console.log('Order payload:', req.body);

        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Validate required fields
        if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Order must contain at least one item'
            });
        }

        if (!req.body.shippingAddress || !req.body.shippingAddress.addressLine1) {
            return res.status(400).json({
                success: false,
                message: 'Shipping address is required'
            });
        }

        const order = new Order({
            user: req.user.userId,
            items: req.body.items.map(item => ({
                product: item.product,
                productName: item.productName,
                productImage: item.productImage,
                quantity: item.quantity,
                price: item.price,
                size: item.size
            })),
            totalAmount: req.body.totalAmount,
            shippingAddress: req.body.shippingAddress,
            paymentMethod: req.body.paymentMethod
        });

        await order.save();

        res.status(201).json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create order'
        });
    }
});

// Get user's orders
router.get('/my-orders', authMiddleware, async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const orders = await Order.find({ user: req.user.userId })
            .sort({ createdAt: -1 })
            .populate('items.product', 'name image price');

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('Fetch orders error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch orders'
        });
    }
});

// Get order by ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const order = await Order.findById(req.params.id)
            .populate('items.product', 'name image price')
            .populate('user', 'fullName email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if the user is authorized to view this order
        if (order.user._id.toString() !== req.user.userId && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Fetch order error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch order'
        });
    }
});

// Admin routes
// Get all orders (admin only)
router.get('/', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .populate('items.product', 'name image price')
            .populate('user', 'fullName email');

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update order status (admin only)
router.patch('/:id/status', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.status = status;
        await order.save();

        res.json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router; 