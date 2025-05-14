const mongoose = require("mongoose"); 
const { Category } = require("./category");

const ProductSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    images: [
        {
            type: String,
            required: true
        }
    ],
    description: {
        type: String,
        required: true
    },
    mrp: {
        type: Number,
        required: true,
        default: 0
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    Category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    sizes: {
        type: [String],
        required: true,
        default: ['XS', 'S', 'M', 'L', 'XL']
    },
    countInStock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    rating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
});

// Add virtual id field
ProductSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

ProductSchema.set('toJSON', {
    virtuals: true,
});

exports.Product = mongoose.model('Product', ProductSchema);