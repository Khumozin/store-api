const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BrandSchema = new Schema({
    Name: {
        type: String,
        required: true,
        trim: true,
        max: 255
    },
    DateCreated: {
        type: String
    },
    DateUpdated: {
        type: String
    }
});

module.exports = mongoose.model('Brand', BrandSchema);