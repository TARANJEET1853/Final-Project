const express = require('express');
const router = express.Router();
const { User } = require('../models/user');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Validate required environment variables
const requiredEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Missing required environment variable: ${envVar}`);
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

// Configure Cloudinary directly
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
});

// Helper function to extract public ID from Cloudinary URL
const getPublicIdFromUrl = (url) => {
    try {
        if (!url) return null;
        // Extract the public ID from URL like: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/avatars/filename
        const urlParts = url.split('/');
        const filename = urlParts[urlParts.length - 1];
        const folderName = urlParts[urlParts.length - 2];
        return `${folderName}/${filename.split('.')[0]}`;
    } catch (error) {
        console.error('Error extracting public ID:', error);
        return null;
    }
};

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-passwordHash');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user profile'
        });
    }
});

// Update user profile
router.put('/profile', [authMiddleware, upload.single('avatar')], async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update basic info
        if (req.body.fullName) user.fullName = req.body.fullName;
        if (req.body.contactNo) user.contactNo = req.body.contactNo;

        // Handle avatar upload
        if (req.file) {
            try {
                // Delete old avatar from Cloudinary if exists
                if (user.avatar) {
                    const publicId = getPublicIdFromUrl(user.avatar);
                    if (publicId) {
                        try {
                            await cloudinary.uploader.destroy(publicId);
                        } catch (deleteError) {
                            console.error('Error deleting old avatar:', deleteError);
                            // Continue with upload even if delete fails
                        }
                    }
                }

                // Upload new avatar to Cloudinary
                const buffer = req.file.buffer;
                const base64Image = buffer.toString('base64');
                const dataURI = `data:${req.file.mimetype};base64,${base64Image}`;
                
                const result = await cloudinary.uploader.upload(dataURI, {
                    folder: 'avatars',
                    transformation: [
                        { width: 400, height: 400, crop: 'fill' },
                        { quality: 'auto' }
                    ]
                });

                // Save Cloudinary URL
                user.avatar = result.secure_url;
            } catch (uploadError) {
                console.error('Error uploading avatar:', uploadError);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to upload avatar'
                });
            }
        }

        await user.save();

        res.json({
            success: true,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                contactNo: user.contactNo,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error('Error updating profile - Full error:', {
            message: error.message,
            stack: error.stack,
            cloudinaryError: error.error?.message,  // Capture Cloudinary specific errors
            details: error
        });
        res.status(500).json({
            success: false,
            message: `Failed to update profile: ${error.message}`
        });
    }
});

module.exports = router; 