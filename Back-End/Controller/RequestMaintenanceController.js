const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const requestmaintenance = require("./../Models/RequestMaintenance");
const Apifeatures = require("./../Utils/ApiFeatures");
<<<<<<< HEAD
const PDFDocument = require("pdfkit");
const user = require("./../Models/usermodel");

const Message = require("./../Models/Message");

const path = require("path");
const fs = require("fs");
const CustomError = require("../Utils/CustomError");
require("pdfkit-table");

const mongoose = require("mongoose");

const MaintenanceActivity = require("../Models/MaintenanceActivity");
const MaintenanceLogs = require("../Models/MaintenanceLogs");

exports.UpdateSenData = AsyncErrorHandler(async (req, res, next) => {
  const requestId = req.params.id;
  const data = req.body;
  const updatedRequest = await requestmaintenance.findByIdAndUpdate(
    requestId,
    { ...data, read: true },
    { new: true },
  );

  // 2. CHECK PARA SA MAINTENANCE LOGS
  // Kung may laman ang alinman sa mga log fields na ito, mag-create/update sa MaintenanceLogs
  if (
    data.Remarks ||
    data.AdjustmentSetting ||
    data.ManHoursUsed ||
    data.CounterMeasures
  ) {
    await MaintenanceLogs.findOneAndUpdate(
      { Request: requestId }, // Filter: hanapin kung may existing log na para sa request na ito
      {
        Request: requestId,
        AnalysisOfTrouble: data.Remarks, // Gaya ng usapan, Remarks ang source nito
        AdjustmentSetting: data.AdjustmentSetting,
        ManHoursUsed: data.ManHoursUsed,
        CounterMeasures: data.CounterMeasures,
        ImprovementInRepairProcedure: data.ImprovementInRepairProcedure,
        SparePartsMaterialsUsed: data.SparePartsMaterialsUsed,
        TechnicalLaboratoryInCharge: req.user._id, // Kunin ang ID ng kasalukuyang user
        RepairDate: data.RepairDate || Date.now(),
      },
      { upsert: true, new: true }, // upsert: true ay gagawa ng bago kung wala pang record
    );
  }

  // 3. CHECK PARA SA MAINTENANCE ACTIVITY
  // Kung may check sa mga activities, i-save sa MaintenanceActivity
  const hasActivityData = [
    "RoutineInspectionCleaning",
    "Lubrication",
    "Overhauling",
    "MinorAdjustment",
    "ReplaceWornOutParts",
    "Repair",
    "GeneralRecondition",
  ].some((field) => data[field] === true);

  if (hasActivityData || data.FrequencyCode) {
    await MaintenanceActivity.findOneAndUpdate(
      { Request: requestId },
      {
        Request: requestId,
        RoutineInspectionCleaning: data.RoutineInspectionCleaning,
        Lubrication: data.Lubrication,
        Overhauling: data.Overhauling,
        MinorAdjustment: data.MinorAdjustment,
        ReplaceWornOutParts: data.ReplaceWornOutParts,
        Repair: data.Repair,
        GeneralRecondition: data.GeneralRecondition,
        RepairPart: data.RepairPart,
        FrequencyCode: data.FrequencyCode,
        PerformedBy: req.user._id,
      },
      { upsert: true, new: true },
    );
  }

  res.status(200).json({
    status: "success",
    data: updatedRequest,
  });
});

exports.RequestMaintenance = AsyncErrorHandler(async (req, res) => {
  console.log("Trigger!!!");
  const { Equipments } = req.body;

  if (!Equipments) {
    return res.status(400).json({
      status: "fail",
      message: "Description: Please Input Description!",
    });
  }

  const equipmentId = new mongoose.Types.ObjectId(Equipments);

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Check duplicate
  const existing = await requestmaintenance.findOne({
    Equipments: equipmentId,
    createdAt: { $gte: twentyFourHoursAgo },
=======
const PDFDocument = require('pdfkit');
const path=require('path');
const fs = require('fs');
const CustomError=require('../Utils/CustomError')
require('pdfkit-table');

const mongoose = require('mongoose');

exports.RequestMaintenance = AsyncErrorHandler(async (req, res) => {
  const { Equipments } = req.body;

  // Convert Equipments to ObjectId if it's in string form
  const equipmentId =new mongoose.Types.ObjectId(Equipments); // Assuming only 1 equipment is passed

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Check if a request for the same equipment exists within the last 24 hours
  const existing = await requestmaintenance.findOne({
    Equipments: equipmentId,
    createdAt: { $gte: twentyFourHoursAgo }
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  });

  if (existing) {
    return res.status(400).json({
      status: "fail",
<<<<<<< HEAD
      message:
        "Duplicate request: This equipment already has a maintenance request in the last 24 hours.",
    });
  }

  // Create maintenance request
  const maintenance = await requestmaintenance.create(req.body);

  // -------------------- CREATE MESSAGE --------------------
  // Find all Admin users
  const admins = await user.find({ role: "Admin" }, "_id");

  // Build viewers array (Admins only)
  const viewers = admins.map((admin) => ({
    user: admin._id,
    isRead: false,
  }));

  const messageData = {
    message: `New maintenance request created for Equipment ID: ${Equipments}.`,
    Status: "Pending",
    Laboratory: maintenance.Laboratory ? [maintenance.Laboratory] : [],
    To: "Admin",
    Encharge: null, // no specific technician
    role: "Admin",
    RequestID: maintenance._id,
    viewers,
  };

  await Message.create(messageData);
  console.log(`Message saved for maintenance request ${maintenance._id}`);

  res.status(201).json({
    status: "success",
    data: maintenance,
  });
});

=======
      message: "Duplicate request: This equipment already has a maintenance request in the last 24 hours."
    });
  }

  if(!Equipments){
    return res.status(400).json({
      status: "fail",
      message: "Description: Please Input Description!"
    });
  }

  // Proceed to create new maintenance request
  const maintenance = await requestmaintenance.create(req.body);

  res.status(201).json({
    status: "success",
    data: maintenance
  });
});



>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
exports.DisplayRequest = AsyncErrorHandler(async (req, res) => {
  const features = new Apifeatures(requestmaintenance.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // Declare and await the query result
  const filteredrequest = await features.query;
  const request = await requestmaintenance.aggregate([
    { $match: { _id: { $in: filteredrequest.map((lb) => lb._id) } } },
    {
      $lookup: {
        from: "users",
        localField: "Technician",
        foreignField: "_id",
<<<<<<< HEAD
        as: "TechnicianDetails",
      },
    },
    {
      $unwind: { path: "$TechnicianDetails", preserveNullAndEmptyArrays: true },
    },
=======
        as: "TechnicianDetails"
      }
    },
    { $unwind: { path: "$TechnicianDetails", preserveNullAndEmptyArrays: true } },
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    {
      $lookup: {
        from: "departments",
        localField: "Department",
        foreignField: "_id",
<<<<<<< HEAD
        as: "DepartmentInfo",
      },
=======
        as: "DepartmentInfo"
      }
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    },
    { $unwind: { path: "$DepartmentInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "laboratories",
        localField: "Laboratory",
        foreignField: "_id",
<<<<<<< HEAD
        as: "LaboratoryInfo",
      },
=======
        as: "LaboratoryInfo"
      }
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    },
    { $unwind: { path: "$LaboratoryInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "equipment",
        localField: "Equipments",
        foreignField: "_id",
<<<<<<< HEAD
        as: "EquipmentsInfo",
      },
=======
        as: "EquipmentsInfo"
      }
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    },
    { $unwind: { path: "$EquipmentsInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "categories",
        localField: "EquipmentsInfo.Category",
        foreignField: "_id",
<<<<<<< HEAD
        as: "CategoryInfo",
      },
=======
        as: "CategoryInfo"
      }
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    },
    { $unwind: { path: "$CategoryInfo", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        id: 1,
        DateTime: 1,
        Ref: 1,
        read: 1,
        Status: 1,
        feedback: 1,
        feedbackread: 1,
        Description: 1,
        EquipmentId: { $ifNull: ["$EquipmentsInfo._id", "N/A"] },
        EquipmentName: { $ifNull: ["$EquipmentsInfo.Brand", "N/A"] },
        CategoryName: { $ifNull: ["$CategoryInfo.CategoryName", "N/A"] },
        DepartmentId: "$DepartmentInfo._id",
        _id: 1,
        Remarks: 1,
        Department: { $ifNull: ["$DepartmentInfo.DepartmentName", "N/A"] },
        remarksread: 1,
        laboratoryName: { $ifNull: ["$LaboratoryInfo.LaboratoryName", "N/A"] },
        UserId: "$TechnicianDetails._id",
<<<<<<< HEAD
        Technician: {
          $concat: [
            "$TechnicianDetails.FirstName",
            " ",
            { $ifNull: ["$TechnicianDetails.Middle", ""] },
            " ",
            "$TechnicianDetails.LastName",
          ],
        },
        DateTimeAccomplish: 1,
      },
    },
  ]);

=======
          Technician: {
            $concat: [
              "$TechnicianDetails.FirstName",
              " ",
              { $ifNull: ["$TechnicianDetails.Middle", ""] },
              " ",
              "$TechnicianDetails.LastName"
            ]
          }
        ,
        DateTimeAccomplish: 1
      }
    }
  ]);


>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  res.status(200).json({
    status: "success",
    totalDepartment: request.length, // Fixed typo here
    data: request,
  });
});

exports.DisplayNotifictaionRequest = AsyncErrorHandler(async (req, res) => {
  const features = new Apifeatures(
    requestmaintenance.find({ read: false }), // Only get unread requests
<<<<<<< HEAD
    req.query,
=======
    req.query
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  )

    .filter()
    .sort()
    .limitFields()
    .paginate();

  // Declare and await the query result
  const filteredrequest = await features.query;

  const request = await requestmaintenance.aggregate([
    {
      $match: {
        _id: { $in: filteredrequest.map((Req) => Req._id) }, // Match only filtered requests
        read: false, // Only include unread requests
      },
    },
    // Lookup User (Foreign Key)
    {
      $lookup: {
        from: "users", // Collection name of the User model
        localField: "Technician",
        foreignField: "_id",
        as: "TechnicianDetails",
      },
    },
    {
      $unwind: {
        path: "$TechnicianDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "departments",
        localField: "Department",
        foreignField: "_id",
        as: "DepartmentInfo",
      },
    },
    {
      $unwind: {
        path: "$DepartmentInfo",
        preserveNullAndEmptyArrays: true,
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
    {
      $unwind: {
        path: "$LaboratoryInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        id: 1,
        DateTime: 1,
        Status: 1,
        Ref: 1,
        Department: { $ifNull: ["$DepartmentInfo.DepartmentName", "N/A"] },
        DepartmentId: "$DepartmentInfo._id",
        _id: 1,
        laboratoryName: { $ifNull: ["$LaboratoryInfo.LaboratoryName", "N/A"] },
        // Include User Details
        UserId: "$TechnicianDetails._id",
        Technician: {
          $concat: [
            "$TechnicianDetails.FirstName",
            " ", // Space between names
            { $ifNull: ["$TechnicianDetails.Middle", ""] },
            " ", // Space before Last Name
            "$TechnicianDetails.LastName",
          ],
        },
<<<<<<< HEAD
        DateTimeAccomplish: 1,
=======
        DateTimeAccomplish:1
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    totalUnreadRequests: request.length, // Count only unread requests
    data: request,
  });
});

exports.DeleteRequest = AsyncErrorHandler(async (req, res) => {
  await requestmaintenance.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    data: null,
  });
});

<<<<<<< HEAD
=======
exports.UpdateSenData = AsyncErrorHandler(async (req, res, next) => {
  const updatedata = await requestmaintenance.findByIdAndUpdate(
    req.params.id,
    { ...req.body, read: true },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    data: updatedata,
  });
});

>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
exports.getRequest = AsyncErrorHandler(async (req, res, next) => {
  const filteredrequest = await requestmaintenance.findById(req.params.id);

  if (!filteredrequest) {
    const error = new CustomError("Request with the ID is not found", 404);
    return next(error);
  }

  const detailedRequest = await requestmaintenance.aggregate([
    { $match: { _id: filteredrequest._id } },
    {
      $lookup: {
        from: "users",
        localField: "Technician",
        foreignField: "_id",
<<<<<<< HEAD
        as: "TechnicianDetails",
      },
    },
    {
      $unwind: { path: "$TechnicianDetails", preserveNullAndEmptyArrays: true },
    },
=======
        as: "TechnicianDetails"
      }
    },
    { $unwind: { path: "$TechnicianDetails", preserveNullAndEmptyArrays: true } },
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    {
      $lookup: {
        from: "departments",
        localField: "Department",
        foreignField: "_id",
<<<<<<< HEAD
        as: "DepartmentInfo",
      },
=======
        as: "DepartmentInfo"
      }
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    },
    { $unwind: { path: "$DepartmentInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "laboratories",
        localField: "Laboratory",
        foreignField: "_id",
<<<<<<< HEAD
        as: "LaboratoryInfo",
      },
=======
        as: "LaboratoryInfo"
      }
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    },
    { $unwind: { path: "$LaboratoryInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "equipment",
        localField: "Equipments",
        foreignField: "_id",
<<<<<<< HEAD
        as: "EquipmentsInfo",
      },
=======
        as: "EquipmentsInfo"
      }
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    },
    { $unwind: { path: "$EquipmentsInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "categories",
        localField: "EquipmentsInfo.Category",
        foreignField: "_id",
<<<<<<< HEAD
        as: "CategoryInfo",
      },
=======
        as: "CategoryInfo"
      }
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    },
    { $unwind: { path: "$CategoryInfo", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        id: 1,
        DateTime: 1,
        Ref: 1,
        read: 1,
        Status: 1,
        feedback: 1,
        feedbackread: 1,
        Description: 1,
        EquipmentId: { $ifNull: ["$EquipmentsInfo._id", "N/A"] },
        EquipmentName: { $ifNull: ["$EquipmentsInfo.Brand", "N/A"] },
        CategoryName: { $ifNull: ["$CategoryInfo.CategoryName", "N/A"] },
        DepartmentId: "$DepartmentInfo._id",
        _id: 1,
        Remarks: 1,
        Department: { $ifNull: ["$DepartmentInfo.DepartmentName", "N/A"] },
        remarksread: 1,
        laboratoryName: { $ifNull: ["$LaboratoryInfo.LaboratoryName", "N/A"] },
        UserId: "$TechnicianDetails._id",
        Technician: {
          $concat: [
            "$TechnicianDetails.FirstName",
            " ",
            { $ifNull: ["$TechnicianDetails.Middle", ""] },
            " ",
<<<<<<< HEAD
            "$TechnicianDetails.LastName",
          ],
        },
        DateTimeAccomplish: 1,
      },
    },
=======
            "$TechnicianDetails.LastName"
          ]
        },
        DateTimeAccomplish: 1
      }
    }
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  ]);

  res.status(200).json({
    status: "success",
    data: detailedRequest,
  });
});

<<<<<<< HEAD
=======

>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
exports.getSpecificMaintenance = AsyncErrorHandler(async (req, res, next) => {
  const departmentID = req.query.Department;
  const fromDate = req.query.from;
  const toDate = req.query.to;
  const status = req.query.Status;
  const pageNumber = parseInt(req.query.pageNumber) || 1; // Default to page 1
  const pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 items per page

  let startDate = new Date(fromDate);
  let endDate = new Date(toDate);

  if (isNaN(startDate) || isNaN(endDate)) {
<<<<<<< HEAD
    return next(new CustomError("Invalid date format", 400));
=======
    return next(new CustomError('Invalid date format', 400));
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  const query = {
    DateTime: {
      $gte: startDate,
<<<<<<< HEAD
      $lte: endDate,
    },
=======
      $lte: endDate
    }
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  };

  if (departmentID && mongoose.Types.ObjectId.isValid(departmentID)) {
    query.Department = departmentID;
  }

  if (status && status !== "All") {
    query.Status = status;
  }

  const totalCount = await requestmaintenance.countDocuments(query); // Get total count for pagination

<<<<<<< HEAD
  const labs = await requestmaintenance
    .find(query)
=======
  const labs = await requestmaintenance.find(query)
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    .skip((pageNumber - 1) * pageSize) // Skip records based on page number
    .limit(pageSize); // Limit the records per page

  if (!labs || labs.length === 0) {
<<<<<<< HEAD
    return next(
      new CustomError("No maintenance found for the given filters", 404),
    );
=======
    return next(new CustomError('No maintenance found for the given filters', 404));
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  }

  const request = await requestmaintenance.aggregate([
    { $match: { _id: { $in: labs.map((lb) => lb._id) } } },
    {
      $lookup: {
        from: "users",
        localField: "Technician",
        foreignField: "_id",
<<<<<<< HEAD
        as: "TechnicianDetails",
      },
    },
    {
      $unwind: { path: "$TechnicianDetails", preserveNullAndEmptyArrays: true },
    },
=======
        as: "TechnicianDetails"
      }
    },
    { $unwind: { path: "$TechnicianDetails", preserveNullAndEmptyArrays: true } },
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    {
      $lookup: {
        from: "departments",
        localField: "Department",
        foreignField: "_id",
<<<<<<< HEAD
        as: "DepartmentInfo",
      },
=======
        as: "DepartmentInfo"
      }
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    },
    { $unwind: { path: "$DepartmentInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "laboratories",
        localField: "Laboratory",
        foreignField: "_id",
<<<<<<< HEAD
        as: "LaboratoryInfo",
      },
=======
        as: "LaboratoryInfo"
      }
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    },
    { $unwind: { path: "$LaboratoryInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "equipment",
        localField: "Equipments",
        foreignField: "_id",
<<<<<<< HEAD
        as: "EquipmentsInfo",
      },
=======
        as: "EquipmentsInfo"
      }
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    },
    { $unwind: { path: "$EquipmentsInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "categories",
        localField: "EquipmentsInfo.Category",
        foreignField: "_id",
<<<<<<< HEAD
        as: "CategoryInfo",
      },
=======
        as: "CategoryInfo"
      }
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    },
    { $unwind: { path: "$CategoryInfo", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        id: 1,
        DateTime: 1,
        Ref: 1,
        read: 1,
        Status: 1,
        feedback: 1,
        feedbackread: 1,
        Description: 1,
        EquipmentId: { $ifNull: ["$EquipmentsInfo._id", "N/A"] },
        EquipmentName: { $ifNull: ["$EquipmentsInfo.Brand", "N/A"] },
        CategoryName: { $ifNull: ["$CategoryInfo.CategoryName", "N/A"] },
        DepartmentId: "$DepartmentInfo._id",
        _id: 1,
        Remarks: 1,
        Department: { $ifNull: ["$DepartmentInfo.DepartmentName", "N/A"] },
        remarksread: 1,
        laboratoryName: { $ifNull: ["$LaboratoryInfo.LaboratoryName", "N/A"] },
        UserId: "$TechnicianDetails._id",
        Technician: {
          $concat: [
            "$TechnicianDetails.FirstName",
            " ",
            { $ifNull: ["$TechnicianDetails.Middle", ""] },
            " ",
<<<<<<< HEAD
            "$TechnicianDetails.LastName",
          ],
        },
        DateTimeAccomplish: 1,
      },
    },
  ]);

  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 30 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=Maintenance_History" + Date.now() + ".pdf",
  );
  doc.pipe(res);

  const logoPath = path.join(__dirname, "../public/image/logo.jpg");
=======
            "$TechnicianDetails.LastName"
          ]
        },
        DateTimeAccomplish: 1
      }
    }
  ]);

  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 30 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=Maintenance_History' + Date.now() + '.pdf');
  doc.pipe(res);

  const logoPath = path.join(__dirname, '../public/image/logo.jpg');
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  if (fs.existsSync(logoPath)) {
    const logoWidth = 60;
    const centerX = (doc.page.width - logoWidth) / 2;
    doc.image(logoPath, centerX, 30, { width: logoWidth });
  }

  doc.moveDown(6);

  doc
<<<<<<< HEAD
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("Republic of the Philippines", { align: "center" })
    .moveDown(0.2)
    .text("BILIRAN PROVINCE STATE UNIVERSITY", { align: "center" })
    .moveDown(0.2)
    .text("6560 Naval, Biliran Province", { align: "center" })
    .moveDown(1);

  const startX = doc.page.margins.left;
  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("Maintenance History Report", { align: "center" });
=======
    .font('Helvetica-Bold')
    .fontSize(10)
    .text('Republic of the Philippines', { align: 'center' })
    .moveDown(0.2)
    .text('BILIRAN PROVINCE STATE UNIVERSITY', { align: 'center' })
    .moveDown(0.2)
    .text('6560 Naval, Biliran Province', { align: 'center' })
    .moveDown(1);

  const startX = doc.page.margins.left;
  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  });

  doc.font('Helvetica-Bold').fontSize(12).text('Maintenance History Report', { align: 'center' });
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  doc.moveDown();
  doc.text(`Total Laboratories: ${request.length}`);
  doc.text(`Date: ${generatedDate}`);
  doc.text(`Page: ${pageNumber} of ${Math.ceil(totalCount / pageSize)}`); // Display page number
  doc.moveDown(2);

<<<<<<< HEAD
  const tableHeaders = [
    "Date",
    "Equipment",
    "Description",
    "Remarks",
    "Status",
    "Technician",
    "Laboratory",
    "Department",
    "Feedback",
    "Date Accomplish",
  ];
  const columnWidths = [80, 80, 80, 80, 60, 80, 80, 80, 80, 80];
  const tableWidth = columnWidths.reduce((a, b) => a + b, 0);
  const pageWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const startXTable = doc.page.margins.left + (pageWidth - tableWidth) / 2;
  const rowHeight = 30;
  let currentY = doc.y;
  const pageHeight =
    doc.page.height - doc.page.margins.top - doc.page.margins.bottom;

  doc.font("Helvetica-Bold").fontSize(10);
  tableHeaders.forEach((header, index) => {
    doc.text(
      header,
      startXTable + columnWidths.slice(0, index).reduce((a, b) => a + b, 0),
      currentY,
      {
        width: columnWidths[index],
        align: "left",
      },
    );
  });

  currentY += rowHeight;
  doc
    .moveTo(startXTable, currentY)
    .lineTo(startXTable + tableWidth, currentY)
    .stroke();
  currentY += 5;

  doc.font("Helvetica").fontSize(10);
=======
  const tableHeaders = ['Date', 'Equipment', 'Description','Remarks', 'Status', 'Technician', 'Laboratory', 'Department', 'Feedback', 'Date Accomplish'];
  const columnWidths = [80, 80,80,80, 60, 80, 80, 80, 80, 80];
  const tableWidth = columnWidths.reduce((a, b) => a + b, 0);
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const startXTable = doc.page.margins.left + (pageWidth - tableWidth) / 2;
  const rowHeight = 30;
  let currentY = doc.y;
  const pageHeight = doc.page.height - doc.page.margins.top - doc.page.margins.bottom;

  doc.font('Helvetica-Bold').fontSize(10);
  tableHeaders.forEach((header, index) => {
    doc.text(header, startXTable + columnWidths.slice(0, index).reduce((a, b) => a + b, 0), currentY, {
      width: columnWidths[index],
      align: 'left',
    });
  });

  currentY += rowHeight;
  doc.moveTo(startXTable, currentY).lineTo(startXTable + tableWidth, currentY).stroke();
  currentY += 5;

  doc.font('Helvetica').fontSize(10);
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae

  // Function to check and add a new page
  const checkAndAddPage = () => {
    if (currentY + rowHeight > pageHeight) {
      doc.addPage();
      currentY = doc.y;

      // Redraw headers on new page
<<<<<<< HEAD
      doc.font("Helvetica-Bold").fontSize(10);
      tableHeaders.forEach((header, index) => {
        doc.text(
          header,
          startXTable + columnWidths.slice(0, index).reduce((a, b) => a + b, 0),
          currentY,
          {
            width: columnWidths[index],
            align: "left",
          },
        );
      });

      currentY += rowHeight;
      doc
        .moveTo(startXTable, currentY)
        .lineTo(startXTable + tableWidth, currentY)
        .stroke();
=======
      doc.font('Helvetica-Bold').fontSize(10);
      tableHeaders.forEach((header, index) => {
        doc.text(header, startXTable + columnWidths.slice(0, index).reduce((a, b) => a + b, 0), currentY, {
          width: columnWidths[index],
          align: 'left',
        });
      });

      currentY += rowHeight;
      doc.moveTo(startXTable, currentY).lineTo(startXTable + tableWidth, currentY).stroke();
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
      currentY += 5;
    }
  };

  request.forEach((lab) => {
    checkAndAddPage();

    const formattedDate = lab.DateTime
<<<<<<< HEAD
      ? new Date(lab.DateTime).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A";

    const Accomplish = lab.DateTimeAccomplish
      ? new Date(lab.DateTimeAccomplish).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A";

    const rowData = [
      formattedDate,
      `${lab.EquipmentName || "N/A"} / ${lab.CategoryName || "N/A"}`,
      lab.Description || "N/A",
      lab.Remarks || "N/A",
      lab.Status || "N/A",
      lab.Technician || "N/A",
      lab.laboratoryName || "N/A",
      lab.Department || "N/A",
      lab.feedback || "N/A",
      Accomplish,
    ];

    rowData.forEach((text, index) => {
      doc.text(
        text,
        startXTable + columnWidths.slice(0, index).reduce((a, b) => a + b, 0),
        currentY,
        {
          width: columnWidths[index],
          align: "left",
        },
      );
=======
      ? new Date(lab.DateTime).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'N/A';

    const Accomplish = lab.DateTimeAccomplish
      ? new Date(lab.DateTimeAccomplish).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'N/A';

    const rowData = [
      formattedDate,
      `${lab.EquipmentName || 'N/A'} / ${lab.CategoryName || 'N/A'}`,
      lab.Description || 'N/A',
      lab.Remarks || 'N/A',
      lab.Status || 'N/A',
      lab.Technician || 'N/A',
      lab.laboratoryName || 'N/A',
      lab.Department || 'N/A',
      lab.feedback || 'N/A',
      Accomplish
    ];

    rowData.forEach((text, index) => {
      doc.text(text, startXTable + columnWidths.slice(0, index).reduce((a, b) => a + b, 0), currentY, {
        width: columnWidths[index],
        align: 'left',
      });
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    });

    currentY += rowHeight;
  });

<<<<<<< HEAD
  doc
    .moveTo(startXTable, currentY)
    .lineTo(startXTable + tableWidth, currentY)
    .stroke();

  // Footer
  doc.moveDown(1);
  const footerText = "Generated by EPDO";
  const footerX = doc.page.margins.left;

  doc.fontSize(10).text(footerText, footerX, currentY + 10, { align: "left" });
=======
  doc.moveTo(startXTable, currentY).lineTo(startXTable + tableWidth, currentY).stroke();

  // Footer
  doc.moveDown(1);
  const footerText = 'Generated by EPDO';
  const footerX = doc.page.margins.left;

  doc.fontSize(10).text(footerText, footerX, currentY + 10, { align: 'left' });
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae

  doc.end();
});

<<<<<<< HEAD
exports.getMonthlyMaintenanceGraph = AsyncErrorHandler(
  async (req, res, next) => {
    try {
      const data = await requestmaintenance.aggregate([
        {
          $project: {
            month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          },
        },
        {
          $group: {
            _id: "$month",
            total: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

exports.DisplayRequestMaintenanceActvity = AsyncErrorHandler(async (req, res, next) => {
  // 1. DATA FETCHING - Based on MaintenanceActivity linked to Laboratory via Assign
  if (!req.query.laboratory) {
    return next(new CustomError("Please provide a Laboratory ID.", 400));
  }

  const reports = await MaintenanceActivity.aggregate([
    {
      // I-lookup ang Assign record para makuha ang link sa Laboratory
      $lookup: {
        from: "assigns",
        localField: "Request",
        foreignField: "_id",
        as: "AssignInfo",
      },
    },
    { $unwind: "$AssignInfo" },
    {
      // I-filter ang records base sa Laboratory ID na match sa Assign schema
      $match: {
        "AssignInfo.Laboratory": new mongoose.Types.ObjectId(req.query.laboratory)
      }
    },
    {
      // Kunin ang tamang Equipment ID (handle Equipment or Equipments field)
      $addFields: {
        targetEquipmentId: { $ifNull: ["$AssignInfo.Equipment", "$AssignInfo.Equipments"] },
      },
    },
    {
      // Kunin ang Equipment details
      $lookup: {
        from: "equipment",
        localField: "targetEquipmentId",
        foreignField: "_id",
        as: "EquipmentInfo",
      },
    },
    { $unwind: { path: "$EquipmentInfo", preserveNullAndEmptyArrays: true } },
    {
      // Kunin ang Laboratory info para sa header ng report
      $lookup: {
        from: "laboratories",
        localField: "AssignInfo.Laboratory",
        foreignField: "_id",
        as: "LabInfo",
      },
    },
    { $unwind: { path: "$LabInfo", preserveNullAndEmptyArrays: true } },
    {
      // Kunin ang Department info
      $lookup: {
        from: "departments",
        localField: "LabInfo.department",
        foreignField: "_id",
        as: "DeptInfo",
      },
    },
    { $unwind: { path: "$DeptInfo", preserveNullAndEmptyArrays: true } },
    { $sort: { createdAt: 1 } },
  ]);

  if (!reports || reports.length === 0) {
    return next(new CustomError("No maintenance activities found for this laboratory.", 404));
  }

  // 2. PDF CONFIGURATION
  const doc = new PDFDocument({ size: "A4", margin: 20 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=General_Maintenance_Report.pdf");
  doc.pipe(res);

  const margin = 20;
  const tableWidth = doc.page.width - margin * 2;
  let currentY = margin;

  // Column widths base sa PMS-002 format
  const col = { code: 40, name: 105, act: 38, part: 50, remarks: 65 };

  // --- FUNCTION: DRAW MAIN HEADER ---
  const drawMainHeader = () => {
    const headerH = 85;
    doc.lineWidth(1).rect(margin, currentY, tableWidth, headerH).stroke();

    // Logo
    const logoPath = path.join(__dirname, "../public/image/logo.jpg");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, margin + 10, currentY + 12, { width: 60 });
    }
    doc.moveTo(margin + 80, currentY).lineTo(margin + 80, currentY + headerH).stroke();

    // Title Section
    const infoWidth = 150;
    const centerW = tableWidth - 80 - infoWidth;
    doc.font("Helvetica-Bold").fontSize(8)
      .text("QUALITY MANAGEMENT SYSTEM", margin + 80, currentY + 12, { align: "center", width: centerW })
      .text("PERIODIC MAINTENANCE SYSTEM - FORM", margin + 80, currentY + 22, { align: "center", width: centerW });

    doc.moveTo(margin + 80, currentY + 40).lineTo(margin + 80 + centerW, currentY + 40).stroke();
    doc.fontSize(10).text("GENERAL MAINTENANCE SCHEDULE", margin + 80, currentY + 55, { align: "center", width: centerW });

    // Doc Info (Right)
    const infoX = margin + tableWidth - infoWidth;
    doc.moveTo(infoX, currentY).lineTo(infoX, currentY + headerH).stroke();
    const dInfo = [
      { l: "Document No:", v: "BiPSU-QAA-PMS-002" },
      { l: "Page:", v: "1 of 1" },
      { l: "Effective Date:", v: "Oct 09, 2020" },
      { l: "Issuance/Rev:", v: "02/01" }
    ];
    dInfo.forEach((d, i) => {
      doc.font("Helvetica").fontSize(7).text(d.l, infoX + 5, currentY + 8 + i * 18);
      doc.font("Helvetica-Bold").text(d.v, infoX + 70, currentY + 8 + i * 18);
      if (i < 3) doc.moveTo(infoX, currentY + 22 + i * 18).lineTo(margin + tableWidth, currentY + 22 + i * 18).stroke();
    });

    currentY += headerH + 15;
    const dept = reports[0].DeptInfo?.DepartmentName || "N/A";
    const lab = reports[0].LabInfo?.LaboratoryName || "N/A";
    doc.font("Helvetica-Bold").fontSize(9).text(`SCHOOL/OFFICE OF: ${dept} / ${lab}`.toUpperCase(), margin, currentY, { align: "center", width: tableWidth });
    currentY += 20;
  };

  // --- FUNCTION: DRAW TABLE LABELS ---
  const drawTableLabels = () => {
    const thHeight = 50;
    doc.lineWidth(1).rect(margin, currentY, tableWidth, thHeight).stroke();
    let x = margin;
    doc.fontSize(6).font("Helvetica-Bold");

    doc.text("Code No.", x, currentY + 18, { width: col.code, align: "center" });
    x += col.code;
    doc.moveTo(x, currentY).lineTo(x, currentY + thHeight).stroke();

    doc.text("Name of Equipment/Tools", x + 2, currentY + 15, { width: col.name - 4, align: "center" });
    x += col.name;
    doc.moveTo(x, currentY).lineTo(x, currentY + thHeight).stroke();

    const actTotalW = col.act * 7;
    doc.text("MAINTENANCE ACTIVITY", x, currentY + 5, { width: actTotalW, align: "center" });
    doc.moveTo(x, currentY + 15).lineTo(x + actTotalW, currentY + 15).stroke();

    const subs = ["Routine\nInsp.", "Lubri-\ncation", "Over-\nhauling", "Minor\nAdjust.", "Replace\nParts", "Repair", "Gen.\nRecon."];
    subs.forEach((s) => {
      doc.fontSize(5.5).text(s, x, currentY + 18, { width: col.act, align: "center" });
      x += col.act;
      doc.moveTo(x, currentY + 15).lineTo(x, currentY + thHeight).stroke();
    });

    doc.fontSize(6).text("Repair Part", x, currentY + 18, { width: col.part, align: "center" });
    x += col.part;
    doc.moveTo(x, currentY).lineTo(x, currentY + thHeight).stroke();
    doc.text("Remarks", x, currentY + 18, { width: col.remarks, align: "center" });

    currentY += thHeight;
  };

  // Initial Draw
  drawMainHeader();
  drawTableLabels();

  // 3. RENDER DATA ROWS
  reports.forEach((item) => {
    const itemName = `${item.EquipmentInfo?.Brand || ""} ${item.EquipmentInfo?.Model || ""}`.trim() || "N/A";
    const serial = item.EquipmentInfo?.SerialNumber || "-";
    const rowH = Math.max(doc.heightOfString(itemName, { width: col.name - 5 }) + 15, 30);

    // Page Break Check
    if (currentY + rowH > 720) {
      doc.addPage();
      currentY = margin;
      drawTableLabels();
    }

    doc.lineWidth(1).rect(margin, currentY, tableWidth, rowH).stroke();
    let x = margin;
    doc.font("Helvetica").fontSize(6.5);

    // Code/Serial
    doc.text(serial, x, currentY + 10, { width: col.code, align: "center" });
    x += col.code;
    doc.moveTo(x, currentY).lineTo(x, currentY + rowH).stroke();

    // Brand/Model
    doc.text(itemName, x + 3, currentY + 10, { width: col.name - 6 });
    x += col.name;
    doc.moveTo(x, currentY).lineTo(x, currentY + rowH).stroke();

    // Activities (Checkmarks)
    const activities = [
      item.RoutineInspectionCleaning, item.Lubrication, item.Overhauling,
      item.MinorAdjustment, item.ReplaceWornOutParts, item.Repair, item.GeneralRecondition
    ];

    activities.forEach((val) => {
      if (val === true || String(val) === "true") {
        doc.font("ZapfDingbats").fontSize(8).text("4", x, currentY + 10, { width: col.act, align: "center" });
      }
      x += col.act;
      doc.font("Helvetica").moveTo(x, currentY).lineTo(x, currentY + rowH).stroke();
    });

    // Repair Part
    doc.text(item.RepairPart || "-", x + 2, currentY + 10, { width: col.part - 4 });
    x += col.part;
    doc.moveTo(x, currentY).lineTo(x, currentY + rowH).stroke();

    // Remarks
    doc.text(item.remarks || "-", x + 2, currentY + 10, { width: col.remarks - 4 });

    currentY += rowH;
  });

  // 4. LEGEND SECTION
  const legendH = 65;
  if (currentY + legendH > 780) {
    doc.addPage();
    currentY = margin;
  }
  doc.rect(margin, currentY, tableWidth, legendH).stroke();
  doc.font("Helvetica-Bold").fontSize(7).text("FREQUENCY CODE", margin + 5, currentY + 5);
  const legend = ["D - Daily", "M - Monthly", "W - Weekly", "SM - Semi-Monthly", "SA - Semi Annually", "Q - Quarterly", "A - Annually"];
  doc.font("Helvetica").fontSize(6);
  legend.forEach((txt, i) => {
    const lx = i < 4 ? margin + 5 : margin + 120;
    const ly = currentY + 15 + (i % 4) * 10;
    doc.text(txt, lx, ly);
  });

  currentY += legendH + 40;

  // 5. SIGNATORIES
  const sigW = tableWidth / 3;
  const sigs = ["Prepared:", "Attested:", "Approved:"];
  sigs.forEach((lbl, i) => {
    const sx = margin + i * sigW;
    doc.font("Helvetica-Bold").fontSize(8).text(lbl, sx, currentY);
    doc.font("Helvetica").text("____________________", sx, currentY + 25);
  });

  doc.end();
});

exports.DisplayMaintenanceLogs = AsyncErrorHandler(async (req, res, next) => {
  // 1. DATA FETCHING (Flattened - Inalis ang $group)
  let matchStage = {};
  if (req.query.laboratory) {
    matchStage["AssignInfo.Laboratory"] = new mongoose.Types.ObjectId(
      req.query.laboratory,
    );
  }

  const reports = await MaintenanceLogs.aggregate([
    {
      $lookup: {
        from: "assigns",
        localField: "Request",
        foreignField: "_id",
        as: "AssignInfo",
      },
    },
    { $unwind: { path: "$AssignInfo", preserveNullAndEmptyArrays: false } },
    { $match: matchStage },
    {
      $addFields: {
        targetEquipmentId: {
          $ifNull: ["$AssignInfo.Equipment", "$AssignInfo.Equipments"],
        },
      },
    },
    {
      $lookup: {
        from: "equipment",
        localField: "targetEquipmentId",
        foreignField: "_id",
        as: "EquipmentInfo",
      },
    },
    { $unwind: { path: "$EquipmentInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "laboratories",
        localField: "AssignInfo.Laboratory",
        foreignField: "_id",
        as: "LabInfo",
      },
    },
    { $unwind: { path: "$LabInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "departments",
        localField: "LabInfo.department",
        foreignField: "_id",
        as: "DeptInfo",
      },
    },
    { $unwind: { path: "$DeptInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "TechnicalLaboratoryInCharge",
        foreignField: "_id",
        as: "TechInfo",
      },
    },
    { $unwind: { path: "$TechInfo", preserveNullAndEmptyArrays: true } },
    { $sort: { RepairDate: 1 } },
  ]);

  if (!reports.length) return next(new CustomError("No records found.", 404));

  // 2. PDF CONFIG
  const doc = new PDFDocument({ size: "A4", margin: 20 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=Maintenance_Log_Report.pdf",
  );
  doc.pipe(res);

  const margin = 20;
  const tableWidth = doc.page.width - margin * 2;
  let currentY = margin;

  const col = {
    code: 50,
    name: 100,
    period: 55,
    parts: 85,
    mh: 35,
    prob: 95,
    tech: 85,
    date: 50,
  };

  // --- FUNCTION: MAIN HEADER (Logo, Plan Info) ---
  const drawMainHeader = () => {
    const headerHeight = 100;
    doc.lineWidth(1).rect(margin, currentY, tableWidth, headerHeight).stroke();
    const leftWidth = 110;
    const rightWidth = 135;
    const centerWidth = tableWidth - leftWidth - rightWidth;

    doc
      .moveTo(margin + leftWidth, currentY)
      .lineTo(margin + leftWidth, currentY + headerHeight)
      .stroke();
    doc
      .moveTo(margin + tableWidth - rightWidth, currentY)
      .lineTo(margin + tableWidth - rightWidth, currentY + headerHeight)
      .stroke();

    const logoPath = path.join(__dirname, "../public/image/logo.jpg");
    if (fs.existsSync(logoPath))
      doc.image(logoPath, margin + 15, currentY + 10, { width: 80 });

    doc
      .font("Helvetica")
      .fontSize(7)
      .text("Type:", margin + leftWidth + 5, currentY + 10);
    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .text(
        "PERIODIC MAINTENANCE SYSTEM - FORM",
        margin + leftWidth + 5,
        currentY + 22,
        { width: centerWidth - 10, align: "center" },
      );
    doc
      .moveTo(margin + leftWidth, currentY + 45)
      .lineTo(margin + leftWidth + centerWidth, currentY + 45)
      .stroke();
    doc
      .font("Helvetica")
      .fontSize(7)
      .text("Title:", margin + leftWidth + 5, currentY + 52);
    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("MAINTENANCE PLAN/SCHEDULE", margin + leftWidth, currentY + 65, {
        align: "center",
        width: centerWidth,
      });
    doc.text("(SCHEDULE REPAIR)", margin + leftWidth, currentY + 77, {
      align: "center",
      width: centerWidth,
    });

    const infoX = margin + tableWidth - rightWidth;
    const docData = [
      { l: "Document No.:", v: "BiPSU-QAA-PMS-005" },
      { l: "Page:", v: "1 of 1" },
      { l: "Effective Date:", v: "October 09, 2020" },
      { l: "Issuance/Revision:", v: "02/01" },
    ];

    docData.forEach((item, i) => {
      doc
        .font("Helvetica")
        .fontSize(6.5)
        .text(item.l, infoX + 5, currentY + 5 + i * 25);
      doc
        .font("Helvetica-Bold")
        .fontSize(7)
        .text(item.v, infoX + 5, currentY + 13 + i * 25, {
          align: "center",
          width: rightWidth - 10,
        });
      if (i < 3)
        doc
          .moveTo(infoX, currentY + 25 + i * 25)
          .lineTo(margin + tableWidth, currentY + 25 + i * 25)
          .stroke();
    });

    currentY += headerHeight + 10;
    const dept = reports[0].DeptInfo?.DepartmentName || "N/A";
    const lab = reports[0].LabInfo?.LaboratoryName || "N/A";
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("SCHOOL/OFFICE OF", margin, currentY, {
        align: "center",
        width: tableWidth,
      });
    doc
      .fontSize(9)
      .text(`${dept} - ${lab}`.toUpperCase(), margin, currentY + 12, {
        align: "center",
        width: tableWidth,
      });
    currentY += 35;
  };

  // --- FUNCTION: TABLE LABELS ---
  const drawTableLabels = () => {
    const thHeight = 40;
    doc.lineWidth(1).rect(margin, currentY, tableWidth, thHeight).stroke();
    let x = margin;
    const heads = [
      "Code\nNo.",
      "Name of\nEquip/Tools",
      "Period",
      "Spare Parts\nUsed",
      "MH\nUsed",
      "Problem\nEncountered",
      "In-Charge",
      "Date",
    ];
    const wids = Object.values(col);

    doc.font("Helvetica-Bold").fontSize(6.5);
    heads.forEach((h, i) => {
      doc.text(h, x, currentY + 5, { width: wids[i], align: "center" });
      x += wids[i];
      if (i < heads.length - 1)
        doc
          .moveTo(x, currentY)
          .lineTo(x, currentY + thHeight)
          .stroke();
    });
    currentY += thHeight;
  };

  // --- START RENDERING ---
  drawMainHeader();
  drawTableLabels();

  reports.forEach((item) => {
    // Period calculation
    let periodText = "-";
    if (item.EquipmentInfo?.DateTime) {
      const start = new Date(item.EquipmentInfo.DateTime);
      const end = new Date();
      let years = end.getFullYear() - start.getFullYear();
      let months = end.getMonth() - start.getMonth();
      if (months < 0) {
        years--;
        months += 12;
      }
      periodText = years > 0 ? `${years}y ${months}m` : `${months}m`;
    }

    const rowH = Math.max(
      doc.heightOfString(item.AnalysisOfTrouble || "-", {
        width: col.prob - 4,
      }) + 15,
      35,
    );

    if (currentY + rowH > 750) {
      doc.addPage();
      currentY = margin;
      drawTableLabels();
    }

    doc.rect(margin, currentY, tableWidth, rowH).stroke();
    let x = margin;
    const vals = [
      item.EquipmentInfo?.SerialNumber || "-",
      item.EquipmentInfo?.Brand || "-",
      periodText,
      item.SparePartsMaterialsUsed?.join(", ") || "None",
      item.ManHoursUsed || "0",
      item.AnalysisOfTrouble || "-",
      item.TechInfo
        ? `${item.TechInfo.FirstName[0]}. ${item.TechInfo.LastName}`
        : "N/A",
      item.RepairDate ? new Date(item.RepairDate).toLocaleDateString() : "N/A",
    ];

    const wids = Object.values(col);
    doc.font("Helvetica").fontSize(7);
    vals.forEach((v, i) => {
      doc.text(v?.toString() || "", x + 2, currentY + rowH / 2 - 4, {
        width: wids[i] - 4,
        align: "center",
      });
      x += wids[i];
      if (i < vals.length - 1)
        doc
          .moveTo(x, currentY)
          .lineTo(x, currentY + rowH)
          .stroke();
    });
    currentY += rowH;
  });

  // --- SIGNATORIES (Sa huli) ---
  currentY += 40;
  if (currentY + 60 > 800) {
    doc.addPage();
    currentY = margin + 20;
  }
  const sigW = tableWidth / 3;
  ["Prepared:", "Attested:", "Approved:"].forEach((l, i) => {
    const sx = margin + i * sigW;
    doc.font("Helvetica-Bold").fontSize(8).text(l, sx, currentY);
    doc
      .moveTo(sx, currentY + 30)
      .lineTo(sx + sigW - 20, currentY + 30)
      .stroke();
  });

  doc.end();
});

exports.DisplayMaintenanceHistory = AsyncErrorHandler(async (req, res, next) => {
  // 1. DATA FETCHING - Laboratory Filtering via Assign Schema
  if (!req.query.laboratory) {
    return next(new CustomError("Please provide a Laboratory ID.", 400));
  }

  const reports = await MaintenanceActivity.aggregate([
    {
      $lookup: {
        from: "assigns",
        localField: "Request",
        foreignField: "_id",
        as: "AssignInfo",
      },
    },
    { $unwind: "$AssignInfo" },
    {
      // Dito ang match para sa Laboratory ID base sa Assign schema
      $match: {
        "AssignInfo.Laboratory": new mongoose.Types.ObjectId(req.query.laboratory),
      },
    },
    {
      $addFields: {
        targetEquipmentId: {
          $ifNull: ["$AssignInfo.Equipment", "$AssignInfo.Equipments"],
        },
      },
    },
    {
      $lookup: {
        from: "equipment",
        localField: "targetEquipmentId",
        foreignField: "_id",
        as: "EquipmentInfo",
      },
    },
    { $unwind: { path: "$EquipmentInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "laboratories",
        localField: "AssignInfo.Laboratory",
        foreignField: "_id",
        as: "LabInfo",
      },
    },
    { $unwind: { path: "$LabInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "departments",
        localField: "LabInfo.department",
        foreignField: "_id",
        as: "DeptInfo",
      },
    },
    { $unwind: { path: "$DeptInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "PerformedBy",
        foreignField: "_id",
        as: "TechInfo",
      },
    },
    { $unwind: { path: "$TechInfo", preserveNullAndEmptyArrays: true } },
    { $sort: { createdAt: 1 } },
  ]);

  if (!reports.length) {
    return next(new CustomError("No maintenance history found for this laboratory.", 404));
  }

  // 2. PDF CONFIG
  const doc = new PDFDocument({ size: "A4", margin: 20 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=Maintenance_History.pdf");
  doc.pipe(res);

  const margin = 20;
  const tableWidth = doc.page.width - margin * 2;
  let currentY = margin;

  const col = {
    date: 65,
    code: 70,
    name: 110,
    act: 50,
    repair: 50,
    tech: 110,
  };

  // --- FUNCTION: MAIN HEADER ---
  const drawMainHeader = () => {
    const headerHeight = 80;
    doc.lineWidth(1).rect(margin, currentY, tableWidth, headerHeight).stroke();

    const logoPath = path.join(__dirname, "../public/image/logo.jpg");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, margin + 5, currentY + 5, { width: 70 });
    }

    const infoWidth = 155;
    const infoX = margin + tableWidth - infoWidth;
    const centerX = margin + 80;
    const centerWidth = tableWidth - 80 - infoWidth;

    doc.moveTo(margin + 80, currentY).lineTo(margin + 80, currentY + headerHeight).stroke();
    doc.moveTo(infoX, currentY).lineTo(infoX, currentY + headerHeight).stroke();

    doc.font("Helvetica-Bold").fontSize(8.5)
      .text("QUALITY MANAGEMENT SYSTEM", centerX, currentY + 12, { align: "center", width: centerWidth })
      .text("PERIODIC MAINTENANCE SYSTEM - FORM", centerX, currentY + 24, { align: "center", width: centerWidth });

    doc.moveTo(centerX, currentY + 40).lineTo(infoX, currentY + 40).stroke();
    doc.fontSize(10).text("EQUIPMENT MAINTENANCE RECORD", centerX, currentY + 55, { align: "center", width: centerWidth });

    const dInfo = [
      { l: "Document No:", v: "BiPSU-QAA-PMS-004" },
      { l: "Page:", v: "1 of 1" },
      { l: "Effective Date:", v: "Oct 09, 2020" },
      { l: "Issuance/Rev:", v: "03/02" },
    ];

    dInfo.forEach((d, i) => {
      doc.font("Helvetica").fontSize(7).text(d.l, infoX + 5, currentY + 8 + i * 17);
      doc.font("Helvetica-Bold").text(d.v, infoX + 65, currentY + 8 + i * 17);
      if (i < 3) {
        doc.moveTo(infoX, currentY + 22 + i * 17).lineTo(margin + tableWidth, currentY + 22 + i * 17).stroke();
      }
    });

    currentY += 95;
    const deptName = reports[0].DeptInfo?.DepartmentName || "N/A";
    const labName = reports[0].LabInfo?.LaboratoryName || "N/A";
    doc.font("Helvetica-Bold").fontSize(10).text(`SCHOOL/OFFICE OF: ${deptName} / ${labName}`.toUpperCase(), margin, currentY, { align: "center", width: tableWidth });
    currentY += 25;
  };

  // --- FUNCTION: TABLE LABELS ---
  const drawTableLabels = () => {
    const tableHeaderH = 45;
    doc.rect(margin, currentY, tableWidth, tableHeaderH).stroke();
    let x = margin;

    const headers = [
      { l: "Date", w: col.date },
      { l: "Serial No.", w: col.code },
      { l: "Equipment", w: col.name },
    ];

    headers.forEach((h) => {
      doc.fontSize(8.5).font("Helvetica-Bold").text(h.l, x, currentY + 18, { width: h.w, align: "center" });
      x += h.w;
      doc.moveTo(x, currentY).lineTo(x, currentY + tableHeaderH).stroke();
    });

    const workWidth = col.act * 3 + col.repair;
    doc.text("WORK PERFORMED", x, currentY + 4, { width: workWidth, align: "center" });
    doc.moveTo(x, currentY + 14).lineTo(x + workWidth, currentY + 14).stroke();

    const subs = ["Insp/Clean", "Lubrication", "Adjustment", "Repair"];
    subs.forEach((s, i) => {
      const w = i === 3 ? col.repair : col.act;
      doc.fontSize(7).text(s, x, currentY + 18, { width: w, align: "center" });
      x += w;
      if (i < 3) doc.moveTo(x, currentY + 14).lineTo(x, currentY + tableHeaderH).stroke();
    });

    doc.moveTo(x, currentY).lineTo(x, currentY + tableHeaderH).stroke();
    doc.fontSize(8.5).text("Performed by", x, currentY + 18, { width: col.tech, align: "center" });
    currentY += tableHeaderH;
  };

  // --- EXECUTION ---
  drawMainHeader();
  drawTableLabels();

  reports.forEach((item) => {
    const rowH = 30;
    if (currentY + rowH > 750) {
      doc.addPage();
      currentY = margin;
      drawTableLabels();
    }

    doc.rect(margin, currentY, tableWidth, rowH).stroke();
    let x = margin;

    const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-";
    const serial = item.EquipmentInfo?.SerialNumber || "-";
    const eqName = `${item.EquipmentInfo?.Brand || ""} ${item.EquipmentInfo?.Model || ""}`.trim() || "-";

    const data = [
      { v: dateStr, w: col.date },
      { v: serial, w: col.code },
      { v: eqName, w: col.name },
    ];

    data.forEach((c) => {
      doc.font("Helvetica").fontSize(8).text(c.v, x + 2, currentY + 10, { width: c.w - 4, align: "center" });
      x += c.w;
      doc.moveTo(x, currentY).lineTo(x, currentY + rowH).stroke();
    });

    const checks = [
      item.RoutineInspectionCleaning,
      item.Lubrication,
      item.MinorAdjustment,
      item.Repair,
    ];

    checks.forEach((c, i) => {
      const w = i === 3 ? col.repair : col.act;
      if (c === true || String(c) === "true") {
        doc.font("ZapfDingbats").fontSize(10).text("4", x, currentY + 10, { width: w, align: "center" });
      }
      x += w;
      doc.font("Helvetica").moveTo(x, currentY).lineTo(x, currentY + rowH).stroke();
    });

    const tech = item.TechInfo ? `${item.TechInfo.FirstName} ${item.TechInfo.LastName}` : "N/A";
    doc.font("Helvetica").fontSize(7).text(tech, x + 2, currentY + 10, { width: col.tech - 4, align: "center" });

    currentY += rowH;
  });

  // --- SIGNATORIES ---
  currentY += 40;
  if (currentY + 60 > 800) {
    doc.addPage();
    currentY = margin + 20;
  }
  const sigW = tableWidth / 3;
  ["Prepared:", "Attested:", "Approved:"].forEach((l, i) => {
    const sigX = margin + i * sigW;
    doc.font("Helvetica-Bold").fontSize(9).text(l, sigX, currentY);
    doc.font("Helvetica").text("____________________", sigX, currentY + 25);
  });

  doc.end();
});
exports.DisplayToolsandMaintenance = AsyncErrorHandler(async (req, res, next) => {
  // 1. DATA FETCHING - Laboratory Filtering via Assign
  if (!req.query.laboratory) {
    return next(new CustomError("Please provide a Laboratory ID.", 400));
  }

  const reports = await MaintenanceActivity.aggregate([
    {
      $lookup: {
        from: "assigns",
        localField: "Request",
        foreignField: "_id",
        as: "AssignInfo",
      },
    },
    { $unwind: "$AssignInfo" },
    {
      // Dito ang match para sa Laboratory ID base sa Assign schema
      $match: {
        "AssignInfo.Laboratory": new mongoose.Types.ObjectId(req.query.laboratory),
      },
    },
    {
      $addFields: {
        targetEquipmentId: {
          $ifNull: ["$AssignInfo.Equipment", "$AssignInfo.Equipments"],
        },
      },
    },
    {
      $lookup: {
        from: "equipment",
        localField: "targetEquipmentId",
        foreignField: "_id",
        as: "EquipmentInfo",
      },
    },
    { $unwind: { path: "$EquipmentInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "laboratories",
        localField: "AssignInfo.Laboratory",
        foreignField: "_id",
        as: "LabInfo",
      },
    },
    { $unwind: { path: "$LabInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "departments",
        localField: "LabInfo.department",
        foreignField: "_id",
        as: "DeptInfo",
      },
    },
    { $unwind: { path: "$DeptInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "PerformedBy",
        foreignField: "_id",
        as: "TechInfo",
      },
    },
    { $unwind: { path: "$TechInfo", preserveNullAndEmptyArrays: true } },
    { $sort: { createdAt: 1 } },
  ]);

  if (!reports.length) return next(new CustomError("No records found for this laboratory.", 404));

  // 2. PDF CONFIG
  const doc = new PDFDocument({ size: "A4", margin: 20 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=Tools_Maintenance_Record.pdf");
  doc.pipe(res);

  const margin = 20;
  const tableWidth = doc.page.width - margin * 2;
  let currentY = margin;

  const col = {
    date: 60,
    code: 65,
    name: 100,
    act: 55,
    repair: 45,
    tech: 115,
  };

  // --- FUNCTION: MAIN HEADER ---
  const drawMainHeader = () => {
    const headerHeight = 75;
    doc.lineWidth(1).rect(margin, currentY, tableWidth, headerHeight).stroke();

    const logoPath = path.join(__dirname, "../public/image/logo.jpg");
    if (fs.existsSync(logoPath)) doc.image(logoPath, margin + 5, currentY + 5, { width: 65 });

    const infoWidth = 140;
    const infoX = margin + tableWidth - infoWidth;
    const centerX = margin + 75;
    const centerWidth = tableWidth - 75 - infoWidth;

    doc.moveTo(margin + 75, currentY).lineTo(margin + 75, currentY + headerHeight).stroke();
    doc.moveTo(infoX, currentY).lineTo(infoX, currentY + headerHeight).stroke();

    doc.font("Helvetica-Bold").fontSize(8)
      .text("QUALITY MANAGEMENT SYSTEM", centerX, currentY + 12, { align: "center", width: centerWidth })
      .text("PERIODIC MAINTENANCE SYSTEM - FORM", centerX, currentY + 22, { align: "center", width: centerWidth });

    doc.moveTo(centerX, currentY + 35).lineTo(infoX, currentY + 35).stroke();
    doc.fontSize(9).text("TOOLS AND MAINTENANCE RECORD", centerX, currentY + 50, { align: "center", width: centerWidth });

    const docDetails = [
      { l: "Document No:", v: "BiPSU-QAA-PMS-004" },
      { l: "Page:", v: "1 of 1" },
      { l: "Effective Date:", v: "Oct 09, 2020" },
      { l: "Issuance/Rev:", v: "03/02" },
    ];

    docDetails.forEach((d, i) => {
      doc.font("Helvetica").fontSize(6).text(d.l, infoX + 5, currentY + 5 + i * 17);
      doc.font("Helvetica-Bold").text(d.v, infoX + 60, currentY + 5 + i * 17);
      if (i < 3) doc.moveTo(infoX, currentY + 20 + i * 17).lineTo(margin + tableWidth, currentY + 20 + i * 17).stroke();
    });

    currentY += 85;
    const labName = reports[0].LabInfo?.LaboratoryName || "N/A";
    const deptName = reports[0].DeptInfo?.DepartmentName || "N/A";
    doc.font("Helvetica-Bold").fontSize(10).text("SCHOOL/OFFICE OF", margin, currentY, { align: "center", width: tableWidth });
    doc.fontSize(9).text(`${deptName} / ${labName}`.toUpperCase(), margin, currentY + 12, { align: "center", width: tableWidth });
    currentY += 35;
  };

  // --- FUNCTION: TABLE LABELS ---
  const drawTableLabels = () => {
    const tableHeaderH = 45;
    doc.rect(margin, currentY, tableWidth, tableHeaderH).stroke();
    let x = margin;

    const mainHeaders = [
      { l: "Date", w: col.date },
      { l: "Serial No.", w: col.code },
      { l: "Name of Tools", w: col.name },
    ];

    mainHeaders.forEach((h) => {
      doc.fontSize(7).font("Helvetica-Bold").text(h.l, x, currentY + 18, { width: h.w, align: "center" });
      x += h.w;
      doc.moveTo(x, currentY).lineTo(x, currentY + tableHeaderH).stroke();
    });

    const workWidth = col.act * 3 + col.repair;
    doc.text("MAINTENANCE ACTIVITY", x, currentY + 4, { width: workWidth, align: "center" });
    doc.moveTo(x, currentY + 12).lineTo(x + workWidth, currentY + 12).stroke();

    const subActs = [
      { l: "Inspection & Cleaning", w: col.act },
      { l: "Lubrication", w: col.act },
      { l: "Adjustment Calibration", w: col.act },
      { l: "Repair", w: col.repair },
    ];

    subActs.forEach((s, i) => {
      doc.fontSize(6).text(s.l, x + 2, currentY + 15, { width: s.w - 4, align: "center" });
      x += s.w;
      if (i < 3) {
        doc.moveTo(x, currentY + 12).lineTo(x, currentY + tableHeaderH).stroke();
      }
    });

    doc.moveTo(x, currentY).lineTo(x, currentY + tableHeaderH).stroke();
    doc.fontSize(7).text("Performed by", x, currentY + 18, { width: col.tech, align: "center" });
    currentY += tableHeaderH;
  };

  drawMainHeader();
  drawTableLabels();

  // --- RENDER ROWS ---
  reports.forEach((item) => {
    const rowH = 30;
    if (currentY + rowH > 750) {
      doc.addPage();
      currentY = margin;
      drawTableLabels();
    }

    doc.rect(margin, currentY, tableWidth, rowH).stroke();
    let x = margin;

    const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-";
    const serial = item.EquipmentInfo?.SerialNumber || "-";
    const eqName = `${item.EquipmentInfo?.Brand || ""} ${item.EquipmentInfo?.Model || ""}`.trim() || "-";

    const data = [
      { v: dateStr, w: col.date },
      { v: serial, w: col.code },
      { v: eqName, w: col.name },
    ];

    data.forEach((c) => {
      doc.font("Helvetica").fontSize(7).text(c.v, x + 2, currentY + 10, { width: c.w - 4, align: "center" });
      x += c.w;
      doc.moveTo(x, currentY).lineTo(x, currentY + rowH).stroke();
    });

    const checks = [
      item.RoutineInspectionCleaning,
      item.Lubrication,
      item.MinorAdjustment,
      item.Repair,
    ];

    checks.forEach((c, i) => {
      const w = i === 3 ? col.repair : col.act;
      if (c === true || String(c) === "true") {
        doc.font("ZapfDingbats").fontSize(10).text("4", x, currentY + 10, { width: w, align: "center" });
      }
      x += w;
      doc.font("Helvetica").moveTo(x, currentY).lineTo(x, currentY + rowH).stroke();
    });

    const tech = item.TechInfo ? `${item.TechInfo.FirstName} ${item.TechInfo.LastName}` : "N/A";
    doc.font("Helvetica").fontSize(7).text(tech, x + 2, currentY + 10, { width: col.tech - 4, align: "center" });

    currentY += rowH;
  });

  // --- SIGNATORIES ---
  currentY += 40;
  if (currentY + 60 > 800) {
    doc.addPage();
    currentY = margin + 20;
  }
  const sigW = tableWidth / 3;
  ["Prepared:", "Attested:", "Approved:"].forEach((l, i) => {
    const sigX = margin + i * sigW;
    doc.font("Helvetica-Bold").fontSize(9).text(l, sigX, currentY);
    doc.font("Helvetica").text("____________________", sigX, currentY + 25);
  });

  doc.end();
});

exports.DisplayUnscheduledRepair = AsyncErrorHandler(async (req, res, next) => {
  // 1. DATA FETCHING - Laboratory Filtering via Assign Schema
  if (!req.query.laboratory) {
    return next(new CustomError("Please provide a Laboratory ID.", 400));
  }

  const reports = await MaintenanceLogs.aggregate([
    {
      $lookup: {
        from: "assigns",
        localField: "Request",
        foreignField: "_id",
        as: "AssignInfo",
      },
    },
    { $unwind: "$AssignInfo" },
    {
      $match: {
        "AssignInfo.Laboratory": new mongoose.Types.ObjectId(req.query.laboratory),
      },
    },
    {
      $addFields: {
        targetEquipmentId: {
          $ifNull: ["$AssignInfo.Equipment", "$AssignInfo.Equipments"],
        },
      },
    },
    {
      $lookup: {
        from: "equipment",
        localField: "targetEquipmentId",
        foreignField: "_id",
        as: "EquipmentInfo",
      },
    },
    { $unwind: { path: "$EquipmentInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "laboratories",
        localField: "AssignInfo.Laboratory",
        foreignField: "_id",
        as: "LabInfo",
      },
    },
    { $unwind: { path: "$LabInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "departments",
        localField: "LabInfo.department",
        foreignField: "_id",
        as: "DeptInfo",
      },
    },
    { $unwind: { path: "$DeptInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "TechnicalLaboratoryInCharge",
        foreignField: "_id",
        as: "TechInfo",
      },
    },
    { $unwind: { path: "$TechInfo", preserveNullAndEmptyArrays: true } },
    { $sort: { RepairDate: 1 } },
  ]);

  if (!reports || reports.length === 0) {
    return next(new CustomError("No records found for this laboratory.", 404));
  }

  // 2. PDF CONFIGURATION
  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 20 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=Unscheduled_Repair_Record.pdf");
  doc.pipe(res);

  const margin = 20;
  const tableWidth = doc.page.width - margin * 2;
  // Adjusted column widths for landscape (Total: 802 approx)
  const colWidths = [60, 95, 100, 80, 40, 90, 90, 85, 105, 57];
  let currentY = margin;

  // --- FUNCTION: MAIN HEADER ---
  const drawMainHeader = () => {
    const headerH = 75;
    doc.lineWidth(0.8).rect(margin, currentY, tableWidth, headerH).stroke();

    const logoPath = path.join(__dirname, "../public/image/logo.jpg");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, margin + 8, currentY + 5, { width: 60 });
    }

    const infoWidth = 160;
    const infoX = margin + tableWidth - infoWidth;
    const centerAreaX = margin + 75;
    const centerAreaW = tableWidth - 75 - infoWidth;

    doc.moveTo(centerAreaX, currentY).lineTo(centerAreaX, currentY + headerH).stroke();
    doc.moveTo(infoX, currentY).lineTo(infoX, currentY + headerH).stroke();

    doc.font("Helvetica-Bold").fontSize(8).text(
      "QUALITY MANAGEMENT SYSTEM\nPERIODIC MAINTENANCE SYSTEM - FORM",
      centerAreaX,
      currentY + 15,
      { align: "center", width: centerAreaW }
    );

    doc.moveTo(centerAreaX, currentY + 35).lineTo(infoX, currentY + 35).stroke();
    doc.fontSize(10).text(
      "MAINTENANCE PLAN/SCHEDULE\n(UNSCHEDULED REPAIR)",
      centerAreaX,
      currentY + 45,
      { align: "center", width: centerAreaW }
    );

    const details = [
      { l: "Document No:", v: "BiPSU-QAA-PMS-006" },
      { l: "Page:", v: "1 of 1" },
      { l: "Effective Date:", v: "Oct 09, 2020" },
      { l: "Issuance/Rev:", v: "02/01" },
    ];

    details.forEach((d, i) => {
      doc.font("Helvetica").fontSize(7).text(d.l, infoX + 5, currentY + i * 18 + 5);
      doc.font("Helvetica-Bold").text(d.v, infoX + 70, currentY + i * 18 + 5);
      if (i < 3) doc.moveTo(infoX, currentY + (i + 1) * 18).lineTo(margin + tableWidth, currentY + (i + 1) * 18).stroke();
    });

    currentY += 85;
    const dept = reports[0].DeptInfo?.DepartmentName || "N/A";
    const lab = reports[0].LabInfo?.LaboratoryName || "N/A";
    doc.font("Helvetica-Bold").fontSize(11).text(
      `SCHOOL/OFFICE OF: ${dept} / ${lab}`.toUpperCase(),
      margin,
      currentY,
      { align: "center", width: tableWidth }
    );
    currentY += 25;
  };

  // --- FUNCTION: TABLE LABELS (Increased Font Size to 8) ---
  const drawTableLabels = () => {
    const tableHeaderH = 40;
    doc.rect(margin, currentY, tableWidth, tableHeaderH).stroke();
    const labels = [
      "Code No.", "Description", "Analysis of Trouble", "Adjustment Setting",
      "Man Hours", "Counter measures", "Improvement Procedure", "Spare parts Used",
      "Technical In-Charge", "Date"
    ];

    let x = margin;
    doc.font("Helvetica-Bold").fontSize(8); // Pinalaki mula 6
    labels.forEach((l, i) => {
      doc.text(l, x, currentY + 10, { width: colWidths[i], align: "center" });
      x += colWidths[i];
      if (i < colWidths.length - 1) doc.moveTo(x, currentY).lineTo(x, currentY + tableHeaderH).stroke();
    });
    currentY += tableHeaderH;
  };

  drawMainHeader();
  drawTableLabels();

  // --- RENDER ROWS (Increased Font Size to 7.5) ---
  reports.forEach((item) => {
    const eqDesc = `${item.EquipmentInfo?.Brand || ""} ${item.EquipmentInfo?.Model || ""}`.trim();
    const analysis = item.AnalysisOfTrouble || "-";
    const countermeasures = item.CounterMeasures || "-";

    // Dynamic height calculation base sa bagong font size
    doc.fontSize(7.5); 
    const rowHeight = Math.max(
      doc.heightOfString(analysis, { width: colWidths[2] - 4 }),
      doc.heightOfString(countermeasures, { width: colWidths[5] - 4 }),
      doc.heightOfString(eqDesc, { width: colWidths[1] - 4 }),
      35
    );

    if (currentY + rowHeight > doc.page.height - 80) {
      doc.addPage();
      currentY = margin;
      drawTableLabels();
    }

    doc.lineWidth(0.5).rect(margin, currentY, tableWidth, rowHeight).stroke();

    const rowData = [
      item.EquipmentInfo?.SerialNumber || "-",
      eqDesc || "-",
      analysis,
      item.AdjustmentSetting || "-",
      item.ManHoursUsed?.toString() || "-",
      countermeasures,
      item.ImprovementInRepairProcedure || "-",
      Array.isArray(item.SparePartsMaterialsUsed) ? item.SparePartsMaterialsUsed.join(", ") : (item.SparePartsMaterialsUsed || "-"),
      item.TechInfo ? `${item.TechInfo.FirstName} ${item.TechInfo.LastName}` : "N/A",
      item.RepairDate ? new Date(item.RepairDate).toLocaleDateString() : "-",
    ];

    let x = margin;
    doc.font("Helvetica").fontSize(7.5); // Pinalaki mula 6
    rowData.forEach((text, i) => {
      doc.text(text, x + 2, currentY + 8, { width: colWidths[i] - 4, align: "center" });
      x += colWidths[i];
      if (i < colWidths.length - 1) doc.moveTo(x, currentY).lineTo(x, currentY + rowHeight).stroke();
    });

    currentY += rowHeight;
  });

  // --- SIGNATORIES ---
  currentY += 40;
  if (currentY + 60 > doc.page.height - 20) {
    doc.addPage();
    currentY = margin + 20;
  }
  const sigW = tableWidth / 3;
  ["Prepared:", "Attested:", "Approved:"].forEach((s, i) => {
    const sigX = margin + i * sigW;
    doc.font("Helvetica-Bold").fontSize(9).text(s, sigX, currentY);
    doc.font("Helvetica").text("________________________", sigX, currentY + 25);
  });

  doc.end();
});
=======

exports.getMonthlyMaintenanceGraph=AsyncErrorHandler(async(req,res,next)=>{
  try {
    const data = await requestmaintenance.aggregate([
      {
        $project: {
          month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})





>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
