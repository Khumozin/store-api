const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const OrderDetailsSchema = new Schema({
    IsDelivered: {
        type: Boolean,
        required: true
    },
    DateCreated: {
        type: String
    },
    DateUpdated: {
        type: String
    },
    // PayFast Data
    name_first: {
        type: String,
        required: true
    },
    email_address: {
        type: String,
        required: true
    },
    // Transaction Details
    m_payment_id: {
        type: String,
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    item_name: {
        type: String,
        required: true
    },
    item_description: {
        type: String,
        required: true
    },
    custom_str1: {
        type: String
    },
    custom_str2: {
        type: String
    },
    custom_str3: {
        type: String
    },
    // PayFast Response
    pf_payment_id: {
        type: String,
        default: ''
    },
    payment_status: {
        type: String,
        default: ''
    },
    amount_gross: {
        type: String,
        default: ''
    },
    amount_fee: {
        type: String,
        default: ''
    },
    amount_net: {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('OrderDetails', OrderDetailsSchema);