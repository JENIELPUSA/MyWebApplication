const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
    equipment: { type: String, required: true, trim: true },
    ref: { type: String, trim: true },
    category: { type: String, trim: true },
    department: { type: String, required: true, trim: true },
    lab: { type: String, trim: true },
    description: { type: String, required: true, trim: true },
    remarks: { type: String, trim: true },
    status: { 
        type: String, 
        enum: [
            'Pending', 
            'Approved',
            'Assigned', 
            'AssignedTechnician', 
            'InchargeConfirmation', 
            'InchargedConfirmed', 
            'FeedbackSubmitted', 
            'Completed', 
            'Rejected', 
            'Cancelled'
        ], 
        default: 'Pending' 
    },
    technician: { type: String, trim: true },
    date: { type: Date, default: Date.now },
    feedback: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('History', HistorySchema);