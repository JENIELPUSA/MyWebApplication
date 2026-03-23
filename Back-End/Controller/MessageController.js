<<<<<<< HEAD
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const message = require("../Models/Message");
const Apifeatures = require("./../Utils/ApiFeatures");
const sendEmail = require("../Utils/email");

exports.AddMessage = AsyncErrorHandler(async (req, res) => {
  // Create the AssignEquipment document
  const MessageInfo = await message.create(req.body); // Use 'Assign' model with the pre-save hook

  // Send a success response after the document is created and saved
  res.status(201).json({
    status: "success",
    data: MessageInfo,
  });
});

exports.DisplayMessage = AsyncErrorHandler(async (req, res) => {
  const userId = req.user._id;

=======
const AsyncErrorHandler = require('../Utils/AsyncErrorHandler');
const message = require('../Models/Message');
const Apifeatures = require('./../Utils/ApiFeatures');
const sendEmail = require('../Utils/email')

exports.AddMessage = AsyncErrorHandler(async (req, res) => {
    // Create the AssignEquipment document
    const MessageInfo = await message.create(req.body);  // Use 'Assign' model with the pre-save hook

    // Send a success response after the document is created and saved
    res.status(201).json({
        status: 'success',
        data: MessageInfo
    });
});


exports.DisplayMessage = AsyncErrorHandler(async (req, res) => {
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  // Apply Apifeatures methods on the query
  const features = new Apifeatures(message.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

<<<<<<< HEAD
  const filteredMessage = await features.query;

  // Aggregate only messages where the current user is in viewers
  const Messages = await message.aggregate([
    {
      $match: {
        _id: { $in: filteredMessage.map((msg) => msg._id) },
        "viewers.user": userId, // FILTER HERE: viewers.user matches logged-in user
      },
    },
    {
      $lookup: {
        from: "laboratories",
        localField: "Laboratory",
        foreignField: "_id",
        as: "LaboratoryInfo",
      },
    },
    { $unwind: { path: "$LaboratoryInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "equipment",
        localField: "Equipments",
        foreignField: "_id",
        as: "EquipmentsInfo",
      },
    },
    { $unwind: { path: "$EquipmentsInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "LaboratoryInfo.Encharge",
        foreignField: "_id",
        as: "EnchargeInfo",
      },
    },
    { $unwind: { path: "$EnchargeInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "requestmaintenances",
        localField: "RequestID",
        foreignField: "_id",
        as: "RequestMaintenanceInfo",
      },
=======
  // Fetch filtered and paginated data first
  const filteredMessage = await features.query;

  // Apply aggregation only on the filteredMessages
  const Messages = await message.aggregate([
    {
      $match: {
        _id: { $in: filteredMessage.map((msg) => msg._id) } // Match only the filtered messages
      }
    },    
    {
      $lookup: {
        from: "laboratories", // Ensure this matches the collection name in MongoDB
        localField: "Laboratory",
        foreignField: "_id",
        as: "LaboratoryInfo"
      }
    },
    {
      $unwind: {
        path: '$LaboratoryInfo',
        preserveNullAndEmptyArrays: true // Handle items without associated categories
      }
    },
    {
      $lookup: {
        from: 'equipment',
        localField: 'Equipments',
        foreignField: '_id',
        as: 'EquipmentsInfo'
      }
    },
    {
      $unwind: {
        path: "$EquipmentsInfo",
        preserveNullAndEmptyArrays: true
      }
    },
    // Nested Lookup
    {
      $lookup: {
        from: "users", // Ensure this matches the collection name in MongoDB
        localField: "LaboratoryInfo.Encharge",
        foreignField: "_id",
        as: "EnchargeInfo"
      }
    },
    {
      $unwind: {
        path: "$EnchargeInfo",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: "requestmaintenances", // Ensure this matches the collection name in MongoDB
        localField: "RequestID",
        foreignField: "_id",
        as: "RequestMaintenanceInfo"
      }
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    },
    {
      $unwind: {
        path: "$RequestMaintenanceInfo",
<<<<<<< HEAD
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "Encharge",
        foreignField: "_id",
        as: "Technician",
      },
    },
    { $unwind: { path: "$Technician", preserveNullAndEmptyArrays: true } },
=======
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: "users", // Ensure this matches the collection name in MongoDB
        localField: "Encharge",
        foreignField: "_id",
        as: "Technician"
      }
    },
    {
      $unwind: {
        path: "$Technician",
        preserveNullAndEmptyArrays: true
      }
    },
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    {
      $project: {
        id: 1,
        message: 1,
<<<<<<< HEAD
        Status: 1,
        read: 1,
        role: 1,
        DateTime: 1,
        readonUser: 1,
        types: 1,
=======
        Status:1,
        read: 1,
        role:1,
        DateTime: 1,
        readonUser:1,
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
        Equipment: { $ifNull: ["$EquipmentsInfo._id", "N/A"] },
        RequestID: { $ifNull: ["$RequestMaintenanceInfo._id", "N/A"] },
        Ref: { $ifNull: ["$RequestMaintenanceInfo.Ref", "N/A"] },
        laboratoryName: { $ifNull: ["$LaboratoryInfo.LaboratoryName", "N/A"] },
        laboratoryId: { $ifNull: ["$LaboratoryInfo._id", "N/A"] },
<<<<<<< HEAD
        EnchargeId: { $ifNull: ["$EnchargeInfo._id", "N/A"] },
        TechnicianId: { $ifNull: ["$Technician._id", "N/A"] },
        viewers: 1, // Include viewers info
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    totalMessages: Messages.length,
    totalMessagePending: Messages.filter((msg) => msg.Status === "Pending")
      .length,
    data: Messages,
  });
});

exports.UpdateSendMSG = AsyncErrorHandler(async (req, res, next) => {
  const updatedata = await message.findByIdAndUpdate(
    req.params.id,
    { ...req.body }, // Ensure read is updated to true
    { new: true },
  );

  res.status(200).json({
    status: "success",
    data: updatedata,
  });
});
=======
        EnchrageId: { $ifNull: ["$EnchargeInfo._id", "N/A"] },
        TechnicianId: { $ifNull: ["$Technician._id", "N/A"] }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    totalMessages: Messages.length,
    totalMessagePending: Messages.filter((msg) => msg.Status === "Pending").length,
    data: Messages
  });
});


exports.UpdateSendMSG =AsyncErrorHandler(async (req,res,next) =>{
  const updatedata = await message.findByIdAndUpdate(
    req.params.id,
    { ...req.body}, // Ensure read is updated to true
    { new: true }
);

 res.status(200).json({
    status:'success',
    data:
    updatedata
 }); 
})
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae

exports.UpdateAllStatus = AsyncErrorHandler(async (req, res, next) => {
  try {
    const { laboratoryIds, readonUpdate } = req.body;

    // Hanapin muna kung may unread messages
    const unreadMessages = await message.countDocuments({
      _id: { $in: laboratoryIds },
      readonUser: false,
    });

    if (unreadMessages === 0) {
      return res.status(200).json({
        status: "info",
      });
    }

    // Update only unread messages
    const updatedMessages = await message.updateMany(
      { _id: { $in: laboratoryIds }, readonUser: false },
<<<<<<< HEAD
      { $set: { readonUser: readonUpdate } },
=======
      { $set: { readonUser: readonUpdate } }
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    );

    res.status(200).json({
      status: "success",
      updatedCount: updatedMessages.modifiedCount,
      message: "Unread messages updated successfully!",
    });
<<<<<<< HEAD
=======

>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  } catch (error) {
    console.error("Error updating messages:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});

<<<<<<< HEAD
exports.EmailNotification = AsyncErrorHandler(async (req, res, next) => {
  const { emails, message } = req.body;

  try {
    // Ipadala ang email gamit ang message mula sa database
    await sendEmail({
      email: emails,
      subject: "New Notification",
      text: message, // Gamitin ang message content mula sa database
    });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send email", error });
  }
});
=======

exports.EmailNotification =AsyncErrorHandler(async(req,res,next)=>{
  const { emails, message } = req.body;
  

  try {
      // Ipadala ang email gamit ang message mula sa database
      await sendEmail({
          email:emails,
          subject: 'New Notification',
          text: message  // Gamitin ang message content mula sa database
      });

      res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
      res.status(500).json({ message: 'Failed to send email', error });
  }
});




>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
