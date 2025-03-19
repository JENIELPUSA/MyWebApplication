const mongoose = require('mongoose');

// Define Equipment Schema and Model
const EquipmentSchema = new mongoose.Schema({
    Brand: {
        type: String,
        required: [true, 'Please input a Brand!']
    },
    SerialNumber: {
        type: String,
        required: [true, 'Please input a SerialNumber!'],
        unique: true
    },
    Specification: {
        type: String,
        required: [true, 'Please input a Specification!']
    },
    status: {
        type: String,
        enum: ['Available','Sent to Laboratory'],
        default: 'Available'
    },
    Category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    }
});

const Equipment = mongoose.model('Equipment', EquipmentSchema);

module.exports = Equipment;