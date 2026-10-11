const mongoose = require("mongoose");

const EquipmentSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Please input a Brand!"],
    },
    DateTime: {
      type: Date,
      default: () => new Date(),
    },
    Brand: {
      type: String,
      required: [true, "Please input a Brand!"],
    },
    SerialNumber: {
      type: String,
      required: [true, "Please input a SerialNumber!"],
      unique: true,
    },
    Specification: {
      type: String,
      required: [true, "Please input a Specification!"],
    },
    status: {
      type: String,
      enum: ["Not Available", "Available", "Defective", "Missing", "Fixed", "Found"],
      default: "Available",
    },
    Category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    remarks: {
      type: String,
    },
    DateAcquired: {
      type: Date,
    },
  },
  { timestamps: true },
);

// ✅ Pre-save middleware — check Assign collection kapag Fixed o Found ang status
EquipmentSchema.pre("save", async function (next) {
  try {
    if (
      this.isModified("status") &&
      (this.status === "Fixed" || this.status === "Found")
    ) {
      const Assign = mongoose.model("Assign");

      const existingAssign = await Assign.findOne({ Equipments: this._id });

      if (existingAssign) {
        this.status = "Not Available";
      } else {
        this.status = "Available";
      }
    }

    next();
  } catch (error) {
    console.error("❌ Error in Equipment pre-save middleware:", error);
    next(error);
  }
});

const Equipment = mongoose.model("Equipment", EquipmentSchema);

module.exports = Equipment;