const mongoose = require("mongoose");
const MaintenanceLogSchema = new mongoose.Schema(
  {
    Request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assign",
      required: true,
    },

    AnalysisOfTrouble: { type: String, default: "" },
    AdjustmentSetting: { type: String, default: "" },
    ManHoursUsed: { type: Number, default: 8 },
    CounterMeasures: { type: String, default: "" },
    ImprovementInRepairProcedure: { type: String, default: "" },
    SparePartsMaterialsUsed: { type: [String], default: [] },
    TechnicalLaboratoryInCharge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    RepairDate: { type: Date, default: null },
  },
  { timestamps: true },
);

const MaintenanceLog = mongoose.model("MaintenanceLog", MaintenanceLogSchema);
module.exports = MaintenanceLog;
