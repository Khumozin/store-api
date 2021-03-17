const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    Name: {
        type: String,
        required: true,
        trim: true,
        max: 255
    },
    EmailAddress: {
        type: String,
        required: true,
        trim: true,
        min: 5,
        max: 255
    },
    Cellphone: {
        type: String,
        trim: true,
        min: 10,
        max: 255
    },
    Password: {
        type: String,
        required: true,
        min: 6,
        max: 1024
    },
    Role: {
        type: String,
        required: true
    },
    IsActivated: {
        type: Boolean,
        default: false
    },
    ResetPasswordLink: {
        type: String,
        default: ''
    },
    DateCreated: {
        type: String
    },
    DateUpdated: {
        type: String
    }
});

module.exports = mongoose.model('User', UserSchema);