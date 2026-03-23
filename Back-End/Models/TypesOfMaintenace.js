<<<<<<< HEAD
const mongoose = require("mongoose");

const MaintenanceScheduleSchema = new mongoose.Schema(
  {
    equipmentType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assign", // Reference sa iyong MaintenanceRequest model
      required: true,
      unique: true,
    },
    Laboratory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Laboratory", // Reference sa iyong MaintenanceRequest model
      required: true,
    },
    Department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department", // Reference to the Equipment model
      required: true,
    },

    scheduleType: {
      type: String,
      enum: ["weekly", "monthly", "semi-annually", "annually"],
      required: false, // Required na sa UI/controller
    },
    lastMaintenanceDate: {
      type: Date,
      required: false, // Optional, pwedeng hindi pa set
    },
    nextMaintenanceDate: {
      type: Date,
    },
    notified: {
      type: Boolean,
      default: false, // Initially set to false when a new schedule is created
    },
    assignedTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual field to check if overdue
MaintenanceScheduleSchema.virtual("isOverdue").get(function () {
=======
const mongoose = require('mongoose');

const MaintenanceScheduleSchema = new mongoose.Schema({
  equipmentType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',  // Reference sa iyong MaintenanceRequest model
    required: true,
    unique:true
  },
  Laboratory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Laboratory',  // Reference sa iyong MaintenanceRequest model
    required: true
  },
    Department:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Departmentmodel',  // Reference to the Equipment model
      required: true,
    },
  
  scheduleType: {
    type: String,
    enum: ['weekly', 'monthly', 'semi-annually', 'annually'],
    required: false // Required na sa UI/controller
  },
  lastMaintenanceDate: {
    type: Date,
    required: false // Optional, pwedeng hindi pa set
  },
  nextMaintenanceDate: {
    type: Date
  }
,
  notified: {
    type: Boolean,
    default: false, // Initially set to false when a new schedule is created
  },
},

{
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field to check if overdue
MaintenanceScheduleSchema.virtual('isOverdue').get(function () {
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  return this.nextMaintenanceDate && new Date() > this.nextMaintenanceDate;
});

// Auto-calculate next maintenance date based on scheduleType
<<<<<<< HEAD
MaintenanceScheduleSchema.pre("save", function (next) {
=======
MaintenanceScheduleSchema.pre('save', function (next) {
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  const currentDate = new Date(); // Current date
  let nextDate;

  // If scheduleType and lastMaintenanceDate are set
  if (this.scheduleType) {
    // If lastMaintenanceDate is not set, use the current date as last maintenance date
    if (!this.lastMaintenanceDate) {
      this.lastMaintenanceDate = currentDate;
    }

    nextDate = new Date(this.lastMaintenanceDate); // Use last maintenance date or current date if undefined

    switch (this.scheduleType) {
<<<<<<< HEAD
      case "weekly":
        nextDate.setDate(nextDate.getDate() + 7); // Add 7 days for weekly schedule
        break;
      case "monthly":
        nextDate.setMonth(nextDate.getMonth() + 1); // Add 1 month for monthly schedule
        break;
      case "semi-annually":
        nextDate.setMonth(nextDate.getMonth() + 6); // Add 6 months for semi-annually schedule
        break;
      case "annually":
=======
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7); // Add 7 days for weekly schedule
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1); // Add 1 month for monthly schedule
        break;
      case 'semi-annually':
        nextDate.setMonth(nextDate.getMonth() + 6); // Add 6 months for semi-annually schedule
        break;
      case 'annually':
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
        nextDate.setFullYear(nextDate.getFullYear() + 1); // Add 1 year for annual schedule
        break;
      default:
        nextDate.setDate(nextDate.getDate() + 7); // Default to 7 days if no scheduleType is set
    }

<<<<<<< HEAD
    this.nextMaintenanceDate = nextDate; 
  } else {
    this.nextMaintenanceDate = undefined; 
  }

  next(); 
});

const MaintenanceSchedule =
  mongoose.models.MaintenanceSchedule ||
  mongoose.model("MaintenanceSchedule", MaintenanceScheduleSchema);
=======
    this.nextMaintenanceDate = nextDate; // Set next maintenance date
  } else {
    this.nextMaintenanceDate = undefined; // Clear if no scheduleType
  }

  next(); // Proceed with saving the document
});

// Check if the model already exists in Mongoose to prevent the OverwriteModelError
const MaintenanceSchedule = mongoose.models.MaintenanceSchedule || mongoose.model('MaintenanceSchedule', MaintenanceScheduleSchema);
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae

module.exports = MaintenanceSchedule;
