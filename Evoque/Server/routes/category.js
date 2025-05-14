const {Category} = require("../models/category");
const express = require("express");
const router = express.Router();
const cloudinary = require('cloudinary').v2;
require('dotenv').config()
const async = require('async');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// GET all categories
router.get('/', async(req, res) => {
    try {
        const categoryList = await Category.find();
        if(!categoryList) {
            return res.status(404).json({
                success: false,
                message: 'No categories found'
            });
        }
        res.status(200).json({
            success: true,
            categories: categoryList
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching categories'
        });
    }
});

// GET category by ID
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if(!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }
        res.status(200).json({
            success: true,
            category
        });
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching category'
        });
    }
});

// DELETE category
router.delete('/:id', async (req, res) => {
    try {
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);
        if (!deletedCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error deleting category'
        });
    }
});

// UPDATE category
router.put('/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }
        res.status(200).json({
            success: true,
            category
        });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating category'
        });
    }
});

// CREATE category
router.post('/create', async (req, res) => {
    if (!req.body || !req.body.name || !req.body.images) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields'
        });
    }

    try {
        const uploadPromises = req.body.images.map(image => {
            return new Promise(async (resolve, reject) => {
                try {
                    const result = await cloudinary.uploader.upload(image);
                    resolve(result);
                } catch (uploadError) {
                    console.error('Cloudinary upload error:', uploadError);
                    resolve({ secure_url: null });
                }
            });
        });

        const uploadResults = await Promise.all(uploadPromises);
        const imgUrls = uploadResults
            .filter(result => result.secure_url)
            .map(result => result.secure_url);

        if (imgUrls.length === 0) {
            return res.status(500).json({
                success: false,
                message: 'No images were uploaded'
            });
        }

        const newCategory = new Category({
            name: req.body.name,
            images: imgUrls
        });
        const savedCategory = await newCategory.save();
        
        res.status(201).json({
            success: true,
            category: savedCategory
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating category'
        });
    }
});

module.exports = router;