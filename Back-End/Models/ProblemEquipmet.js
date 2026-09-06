const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true,
        index: true
    }
}, {
    timestamps: true
});

// Export
const Problem = mongoose.model('Problem', ProblemSchema);
module.exports = Problem;