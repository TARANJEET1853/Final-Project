const { Product } = require("../models/products");
const { Category } = require("../models/category");
const express = require("express");
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
require('dotenv').config()
const async = require('async');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for memory storage
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
});

// POST: Upload images to Cloudinary
router.post('/upload-images', upload.array('images', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No images uploaded' });
        }

        const uploadPromises = req.files.map(file => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "products" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result.secure_url);
                    }
                );
                stream.end(file.buffer);
            });
        });

        const imageUrls = await Promise.all(uploadPromises);
        res.status(200).json({ success: true, imageUrls });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST: Create a new product
router.post('/', async (req, res) => {
    try {
        if (!req.body || !req.body.name || !req.body.images || !req.body.Category) {
            return res.status(400).json({ error: 'Missing required fields', success: false });
        }

        // Check if the category exists
        const category = await Category.findById(req.body.Category);
        if (!category) {
            return res.status(400).json({ success: false, message: 'Invalid Category' });
        }

        const uploadPromises = req.body.images.map(image => {
            return new Promise(async (resolve, reject) => {
                try {
                    const result = await cloudinary.uploader.upload(image, {
                        folder: "products"
                    });
                    resolve(result);
                } catch (uploadError) {
                    console.error('Cloudinary upload error:', uploadError);
                    resolve({ secure_url: null }); // Resolve with null to avoid breaking Promise.all
                }
            })
        });

        const uploadResults = await Promise.all(uploadPromises);
        const imgUrls = uploadResults.filter(result => result.secure_url).map(result => result.secure_url);

        if (imgUrls.length === 0) {
            return res.status(500).json({ error: 'No images were uploaded', success: false });
        }

        let product = new Product({
            name: req.body.name,
            description: req.body.description,
            images: imgUrls,
            price: req.body.price,
            Category: req.body.Category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        });

        product = await product.save();

        if (!product) {
            return res.status(500).json({ success: false, message: 'The product cannot be created' });
        }

        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET: Retrieve all products
router.get('/', async (req, res) => {
    try {
        const productList = await Product.find().populate('Category');
        if (!productList) {
            return res.status(404).json({ success: false, message: 'No products found' });
        }
        res.status(200).json(productList);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET: Retrieve a single product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('Category');
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT: Update a product
router.put('/:id', async (req, res) => {
    try {
        // Validate category if it's being updated
        if (req.body.Category) {
            const category = await Category.findById(req.body.Category);
            if (!category) {
                return res.status(400).json({ success: false, message: 'Invalid Category' });
            }
        }

        let updateData = { ...req.body };

        // Handle image uploads if new images are provided
        if (req.body.images && Array.isArray(req.body.images)) {
            const uploadPromises = req.body.images.map(image => {
                return new Promise(async (resolve, reject) => {
                    try {
                        // Only upload if it's a new image (base64 or URL starting with data:)
                        if (image.startsWith('data:') || image.startsWith('http')) {
                            const result = await cloudinary.uploader.upload(image, {
                                folder: "products"
                            });
                            resolve(result.secure_url);
                        } else {
                            // Keep existing image URL as is
                            resolve(image);
                        }
                    } catch (uploadError) {
                        console.error('Cloudinary upload error:', uploadError);
                        resolve(null);
                    }
                });
            });

            const uploadResults = await Promise.all(uploadPromises);
            const imgUrls = uploadResults.filter(url => url !== null);

            if (imgUrls.length > 0) {
                updateData.images = imgUrls;
            }
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE: Remove a product and its images from Cloudinary
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Delete images from Cloudinary
        const deletePromises = product.images.map(imageUrl => {
            const publicId = imageUrl.split('/').pop().split('.')[0];
            return cloudinary.uploader.destroy(`products/${publicId}`);
        });

        await Promise.all(deletePromises);
        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: 'Product and associated images deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET: Count of products
router.get('/get/count', async (req, res) => {
    try {
        const productCount = await Product.countDocuments();
        res.status(200).json({ count: productCount });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET: Featured products
router.get('/get/featured/:count', async (req, res) => {
    try {
        const count = req.params.count ? req.params.count : 0;
        const products = await Product.find({ isFeatured: true }).limit(+count);
        if (!products) {
            return res.status(404).json({ success: false, message: 'No featured products found' });
        }
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;