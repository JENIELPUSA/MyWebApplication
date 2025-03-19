const mongoose = require('mongoose');

// Define the MaintenanceRequest schema
const MaintenanceRequestSchema = new mongoose.Schema({
  DateTime: {
    type: String,
    default: () => new Date().toISOString(), // Automatically set current date and time
  },
  Ref: {
    type: String,
    unique: true, // Ensures uniqueness for Ref
  },
  Description: {
    type: String,
    required: [true, 'Please enter a description.'], // Description is required
  },
  Remarks: {
    type: String,
    default: ""
  },
  
  Status: {
    type: String,
  },
  feedback: {
    type: String,
    default: null
  },
  Equipments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',  // Reference to the Equipment model
    required: true,
  }],
  
  Department:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Departmentmodel',  // Reference to the Equipment model
    required: true,
  }],

  Laboratory:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Laboratory',  // Reference to the Equipment model
    required: true,
  }],
  
Technician:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the Equipment model
  }],

  read: { type: Boolean, default: false },  // Para sa unread status
  remarksread: { type: Boolean, default: false },
  feedbackread: { type: Boolean, default: false }

});

// Pre-save hook to automatically generate a unique Ref value
MaintenanceRequestSchema.pre('save', async function(next) {
  if (!this.Ref) {
    // Generate a unique Ref value based on timestamp and a random string
    const timestamp = new Date().getTime(); // Current timestamp in milliseconds
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase(); // Random alphanumeric string
    this.Ref = `0001-${timestamp}-${randomStr}`; // Concatenate them to create a unique value
  }

  next();
});

const RequestMaintenance = mongoose.model('RequestMaintenance', MaintenanceRequestSchema);


module.exports = RequestMaintenance;