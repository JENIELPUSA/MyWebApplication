const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  DateTime: {
    type: String,
    default: () => new Date().toISOString(), // Automatically set current date and time
  },
  message: {
    type: String,
  },
  Status: {
    type: String,
  },
  Laboratory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Laboratory", // Reference to the Equipment model
      required: true,
    },
  ],
<<<<<<< HEAD
  To: {
    type: String,
=======
  To:{
    type:String
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  },
  RequestID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RequestMaintenances", // Reference to the
  },
  Encharge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the
  },
<<<<<<< HEAD
  role: {
    type: String,
    enum: ["Admin", "User", "Technician"],
    default: "User",
    required: true,
  },
  viewers: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      isRead: {
        type: Boolean,
        default: false,
      },
    },
  ],
  types: {
    type: String,
  },
  read: { type: Boolean, default: false },
  readonUser: { type: Boolean, default: false },
=======
  role: { 
    type: String, 
    enum: ["Admin", "User", "Technician"], 
    default: "User",
    required: true 
  }, 
  read: { type: Boolean, default: false },
  readonUser:{ type: Boolean, default: false },
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
});

const Messages = mongoose.model("Message", messageSchema);

module.exports = Messages;
