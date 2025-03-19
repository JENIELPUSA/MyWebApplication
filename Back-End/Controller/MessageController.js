const AsyncErrorHandler = require('../Utils/AsyncErrorHandler');
const message = require('../Models/Message');
const Apifeatures = require('./../Utils/ApiFeatures');

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
  // Apply Apifeatures methods on the query
  const features = new Apifeatures(message.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

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
    },
    {
      $unwind: {
        path: "$RequestMaintenanceInfo",
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
    {
      $project: {
        id: 1,
        message: 1,
        Status:1,
        read: 1,
        DateTime: 1,
        Equipment: { $ifNull: ["$EquipmentsInfo._id", "N/A"] },
        RequestID: { $ifNull: ["$RequestMaintenanceInfo._id", "N/A"] },
        Ref: { $ifNull: ["$RequestMaintenanceInfo.Ref", "N/A"] },
        laboratoryName: { $ifNull: ["$LaboratoryInfo.LaboratoryName", "N/A"] },
        laboratoryId: { $ifNull: ["$LaboratoryInfo._id", "N/A"] },
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
    { ...req.body}, // ✅ Ensure read is updated to true
    { new: true }
);

 res.status(200).json({
    status:'success',
    data:
    updatedata
 }); 
})

