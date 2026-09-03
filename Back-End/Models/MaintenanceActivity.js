const mongoose = require("mongoose");
const MaintenanceActivitySchema = new mongoose.Schema(
  {
    Request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assign",
      required: true,
    },

    RoutineInspectionCleaning: { type: Boolean, default: false },
    Lubrication: { type: Boolean, default: false },
    Overhauling: { type: Boolean, default: false },
    MinorAdjustment: { type: Boolean, default: false },
    ReplaceWornOutParts: { type: Boolean, default: false },
    Repair: { type: Boolean, default: false },
    GeneralRecondition: { type: Boolean, default: false },
    RepairPart: { type: String, default: "" },
    FrequencyCode: {
      type: String,
      enum: ["D", "W", "SM", "M", "Q", "SA", "A"],
      default: "D",
    },
    PerformedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

const MaintenanceActivity = mongoose.model(
  "MaintenanceActivity",
  MaintenanceActivitySchema,
);
module.exports = MaintenanceActivity;
