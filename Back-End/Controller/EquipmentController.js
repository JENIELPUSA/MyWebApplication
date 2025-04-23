const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const tools = require("./../Models/Equipment");
const mongoose = require("mongoose");
const Apifeatures = require("./../Utils/ApiFeatures");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const CustomError = require("../Utils/CustomError");

exports.createtool = AsyncErrorHandler(async (req, res) => {
  // Validate Category if it's provided
  if (
    req.body.Category &&
    !mongoose.Types.ObjectId.isValid(req.body.Category)
  ) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid Category ID format",
    });
  }

  // Validate required fields (Brand, SerialNumber, and Specification)
  const { Brand, SerialNumber, Specification } = req.body;
  if (!Brand || !SerialNumber || !Specification) {
    return res.status(400).json({
      status: "fail",
      message: "Please fill in all required fields.",
    });
  }

  // Create the new tool
  const newTool = await tools.create(req.body);

  // Check if tool creation was successful
  if (!newTool) {
    return res.status(400).json({
      status: "fail",
      message: "Tool creation failed.",
    });
  }

  // Use aggregation to fetch the newly created tool with joined category details
  const toolWithCategory = await tools.aggregate([
    {
      $match: { _id: newTool._id }, // Match the newly created tool by its ID
    },
    {
      $lookup: {
        from: "categories", // The collection to join
        localField: "Category", // Field in tools that references category ID
        foreignField: "_id", // Field in categories to join on
        as: "CategoryData", // Alias for the joined data
      },
    },
    {
      $unwind: {
        path: "$CategoryData",
        preserveNullAndEmptyArrays: true, // Allow null if no matching category
      },
    },
    {
      $project: {
        Brand: 1,
        SerialNumber: 1,
        Specification: 1,
        status: 1,
        CategoryName: {
          $ifNull: ["$CategoryData.CategoryName", "N/A"], // Use 'N/A' if CategoryName is missing
        },
        CategoryId: "$CategoryData._id", // Include the Category ID from the joined data
        _id: 1,
      },
    },
  ]);

  // Respond with the tool including category details
  res.status(201).json({
    status: "success",
    data: toolWithCategory[0], // Send the first item in the aggregation result
  });
});

exports.Displaytool = AsyncErrorHandler(async (req, res) => {
  // Apply Apifeatures methods on the query
  const features = new Apifeatures(tools.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // Fetch filtered and paginated data first
  const filteredTools = await features.query;

  // Apply aggregation only on the filteredTools
  const Equipment = await tools.aggregate([
    {
      $match: {
        _id: { $in: filteredTools.map((tool) => tool._id) }, // Match only the filtered tools
      },
    },
    {
      $lookup: {
        from: "categories", // The name of the collection to join
        localField: "Category", // Field in the Equipment collection
        foreignField: "_id", // Field in the Category collection
        as: "CategoryData", // The field where joined data will be added
      },
    },
    {
      $unwind: {
        path: "$CategoryData",
        preserveNullAndEmptyArrays: true, // Handle items without associated categories
      },
    },
    {
      $project: {
        Brand: 1,
        SerialNumber: 1,
        Specification: 1,
        status: 1,
        CategoryName: {
          $ifNull: ["$CategoryData.CategoryName", "N/A"], // Fallback to 'N/A' if CategoryName is missing
        },
        CategoryId: "$CategoryData._id", // Include the category's ID
        _id: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    totalEquipment: Equipment.length,
    data: Equipment,
  });
});

exports.Updatetool = AsyncErrorHandler(async (req, res, next) => {
  // Check if ID is valid
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res
      .status(400)
      .json({ status: "fail", message: "Invalid ID format" });
  }

  // Update the tool
  const updateTool = await tools.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updateTool) {
    return res.status(404).json({
      status: "fail",
      message: "Tool not found",
    });
  }

  // Use aggregation to retrieve the updated tool with category details
  const toolWithCategory = await tools.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(req.params.id) }, // Ensure `new` is used with ObjectId
    },
    {
      $lookup: {
        from: "categories",
        localField: "Category",
        foreignField: "_id",
        as: "CategoryData",
      },
    },
    {
      $unwind: {
        path: "$CategoryData",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        Brand: 1,
        SerialNumber: 1,
        Specification: 1,
        status: 1,
        CategoryName: {
          $ifNull: ["$CategoryData.CategoryName", "N/A"],
        },
        CategoryId: "$CategoryData._id",
        _id: 1,
      },
    },
  ]);

  // Return the updated tool data along with category details
  res.status(200).json({
    status: "success",
    totalEquipment: toolWithCategory.length,
    data: toolWithCategory[0], // Return the first (and only) result
  });
});

exports.deletetool = AsyncErrorHandler(async (req, res, next) => {
  await tools.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    data: null,
  });
});

exports.Getidequip = AsyncErrorHandler(async (req, res, next) => {
  const tool = await tools.findById(req.params.id);
  if (!tool) {
    const error = new CustomError("User with the ID is not found", 404);
    return next(error);
  }
  res.status(200).json({
    status: "Success",
    data: tool,
  });
});

exports.getSpecificEquipment = AsyncErrorHandler(async (req, res, next) => {
  const fromDate = req.query.from;
  const toDate = req.query.to;
  const status = req.query.status;

  if (!fromDate || !toDate) {
    return next(new CustomError("Missing required date range", 400));
  }

  let startDate = new Date(fromDate);
  let endDate = new Date(toDate);

  if (isNaN(startDate) || isNaN(endDate)) {
    return next(new CustomError("Invalid date format", 400));
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  const matchQuery = {
    DateTime: { $gte: startDate, $lte: endDate },
  };
  if (status && status !== "All") {
    matchQuery.status = status;
  }

  const Equipment = await tools.aggregate([
    { $match: matchQuery },

    {
      $lookup: {
        from: "assigns",
        localField: "_id",
        foreignField: "Equipments",
        as: "Assignments",
      },
    },
    {
      $unwind: {
        path: "$Assignments",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "laboratories",
        localField: "Assignments.Laboratory",
        foreignField: "_id",
        as: "LaboratoryData",
      },
    },
    {
      $unwind: {
        path: "$LaboratoryData",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "departments",
        localField: "LaboratoryData.department",
        foreignField: "_id",
        as: "DepartmentData",
      },
    },
    {
      $unwind: {
        path: "$DepartmentData",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $group: {
        _id: "$_id",
        DateTime: { $first: "$DateTime" },
        EquipmentName: { $first: "$EquipmentName" },
        Specification: { $first: "$Specification" },
        Brand: { $first: "$Brand" },
        status: { $first: "$status" },
        Category: { $first: "$Category" },
        LaboratoryName: {
          $first: { $ifNull: ["$LaboratoryData.LaboratoryName", "N/A"] },
        },
        Department: {
          $first: { $ifNull: ["$DepartmentData.DepartmentName", "N/A"] },
        },
      },
    },
  ]);

  if (!Equipment || Equipment.length === 0) {
    return next(new CustomError("No equipment found for the given filters", 404));
  }

  // PDF Generation
  const doc = new PDFDocument({ size: "A4", layout: "portrait", margin: 60 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=Equipment_Report_${Date.now()}.pdf`
  );
  doc.pipe(res);

  // Logo
  const logoPath = path.join(__dirname, "../public/image/logo.jpg");
  if (fs.existsSync(logoPath)) {
    const logoWidth = 70;
    const centerX = (doc.page.width - logoWidth) / 2;
    doc.image(logoPath, centerX, 30, { width: logoWidth });
  }

  doc.moveDown(3);
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("Republic of the Philippines", { align: "center" })
    .text("BILIRAN PROVINCE STATE UNIVERSITY", { align: "center" })
    .text("6560 Naval, Biliran Province", { align: "center" })
    .moveDown(2);

  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("Equipment Inventory Report", { align: "center" })
    .moveDown()
    .text(`Total Equipments: ${Equipment.length}`)
    .text(`Date: ${generatedDate}`)
    .moveDown(2);

  // Table Setup
  const tableHeaders = ["Date", "Brand", "Specification", "Status", "Laboratory", "Department"];
  const columnWidths = [80, 80, 100, 80, 80, 80];
  const tableWidth = columnWidths.reduce((a, b) => a + b, 0);
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const startXTable = doc.page.margins.left + (pageWidth - tableWidth) / 2;
  const rowHeight = 25;
  const pageHeight = doc.page.height - doc.page.margins.top - doc.page.margins.bottom;
  let currentY = doc.y;

  // Table Headers
  doc.font("Helvetica-Bold").fontSize(12);
  tableHeaders.forEach((header, i) => {
    doc.text(
      header,
      startXTable + columnWidths.slice(0, i).reduce((a, b) => a + b, 0),
      currentY,
      { width: columnWidths[i], align: "left" }
    );
  });

  currentY += rowHeight;
  doc.moveTo(startXTable, currentY).lineTo(startXTable + tableWidth, currentY).stroke();
  currentY += 5;
  doc.font("Helvetica").fontSize(10);

  // Data Rows
  Equipment.forEach((eq) => {
    if (currentY + rowHeight > pageHeight) {
      doc.addPage();
      currentY = 50;
      doc.font("Helvetica-Bold").fontSize(10);
      tableHeaders.forEach((header, i) => {
        doc.text(
          header,
          startXTable + columnWidths.slice(0, i).reduce((a, b) => a + b, 0),
          currentY,
          { width: columnWidths[i], align: "left" }
        );
      });
      currentY += rowHeight;
      doc.moveTo(startXTable, currentY).lineTo(startXTable + tableWidth, currentY).stroke();
      currentY += 5;
      doc.font("Helvetica").fontSize(10);
    }

    const formattedDate = eq.DateTime
      ? new Date(eq.DateTime).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A";

    const rowData = [
      formattedDate,
      eq.Brand || "N/A",
      eq.Specification || "N/A",
      eq.status || "N/A",
      eq.LaboratoryName || "N/A",
      eq.Department || "N/A",
    ];

    rowData.forEach((text, i) => {
      doc.text(
        text,
        startXTable + columnWidths.slice(0, i).reduce((a, b) => a + b, 0),
        currentY,
        { width: columnWidths[i], align: "left" }
      );
    });

    currentY += rowHeight;
  });

  doc.moveTo(startXTable, currentY).lineTo(startXTable + tableWidth, currentY).stroke();
  doc.moveDown(1);

  // Footer
  doc.fontSize(10).text("Generated by EPDO", doc.page.margins.left, currentY + 10);

  doc.end();
});

