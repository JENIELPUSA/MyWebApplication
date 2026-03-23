const mongoose = require("mongoose");
const CalibrationSchema = new mongoose.Schema({
    
  Request: { type: mongoose.Schema.Types.ObjectId, ref: "MaintenanceRequest", required: true },
  Accuracy: { type: String, default: "" }, 
  Error: { type: String, default: "" },    
  CalibratedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
  CalibrationDate: { type: Date, default: null },  
  Observed: { type: String, default: "" },         
  Corrected: { type: String, default: "" },       
  CalibrationRemarks: { type: String, default: "" },
  VerifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },   
});

const Calibration = mongoose.model("Calibration", CalibrationSchema);
module.exports = Calibration;
