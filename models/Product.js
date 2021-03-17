const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    BrandID: {
        type: String
    },
    MainCategoryID: {
        type: String,
        required: true
    },
    SubCategoryID: {
        type: String,
        required: true
    },
    Name: {
        type: String,
        required: true,
        trim: true,
        max: 255
    },
    Description: {
        type: String,
        required: true,
        trim: true,
        max: 255
    },
    Price: {
        type: Number,
        required: true
    },
    IsSale: {
        type: Boolean,
        required: true
    },
    SalePrice: {
        type: Number,
        default: 0
    },
    NumberOfStock: {
        type: Number,
        required: true
    },
    ImagePaths: {
        type: String
    },
    DateCreated: {
        type: String
    },
    DateUpdated: {
        type: String
    }
});

module.exports = mongoose.model('Product', ProductSchema);